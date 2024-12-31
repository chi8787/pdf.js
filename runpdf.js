import * as pdfjsLib from './pdfjs-dist/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = './pdfjs-dist/build/pdf.worker.mjs';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 3,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport
    };
    const renderTask = page.render(renderContext);
    renderTask.promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
  document.getElementById('page_num').textContent = num;
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

document.getElementById('prev').addEventListener('click', () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
});

document.getElementById('next').addEventListener('click', () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
});

function loadPDF(url) {
  pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;
    pageNum = 1;
    renderPage(pageNum);
  }).catch(err => console.error('Error loading PDF:', err));
}

function initPDFList() {
  fetch('/api/pdf-files')
    .then(response => response.json())
    .then(pdfFiles => {
      const pdfList = document.getElementById('pdf-list');
      pdfList.innerHTML = '';
      pdfFiles.forEach(file => {
        const option = document.createElement('option');
        option.value = `/pdf_file/${file}`;
        option.textContent = file;
        pdfList.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching PDF list:', error));
}

document.getElementById('open-pdf').addEventListener('click', () => {
  const selectedPDF = document.getElementById('pdf-list').value;
  if (selectedPDF) {
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('pdf-selection').style.display = 'none';
    document.getElementById('pdf-viewer').style.display = 'block';

    loadPDF(selectedPDF);
  } else {
    alert('plz select a PDF file!');
  }
});

document.getElementById('close-pdf').addEventListener('click', () => {
  pdfDoc = null;
  pageNum = 1;
  document.getElementById('pdf-selection').style.display = 'block';
  document.getElementById('pdf-viewer').style.display = 'none';
});

document.getElementById('global-search-button').addEventListener('click', () => {
  const keyword = document.getElementById('global-search-box').value.trim();
  if (!keyword) {
    alert('plz type a keyword!');
    return;
  }
  searchFiles(keyword);
});

function searchFiles(keyword) {
  fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(results => {
      const resultsContainer = document.getElementById('search-results');
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'block';

      if (!results || results.length === 0) {
        resultsContainer.textContent = 'no revelant file';
        return;
      }

      results.forEach(result => {
        const div = document.createElement('div');
        div.innerHTML = `
          <strong>${result.fileName}</strong><br>
          <button data-file-url="/pdf_file/${result.fileName}">open</button>
        `;
        resultsContainer.appendChild(div);

        div.querySelector('button').addEventListener('click', () => {
          resultsContainer.style.display = 'none';
          openPDF(`/pdf_file/${result.fileName}`);
        });
      });
    })
    .catch(err => {
      console.error('search failed:', err);
    });
}


window.openPDF = function (url) {
  document.getElementById('search-results').style.display = 'none';
  document.getElementById('pdf-selection').style.display = 'none';
  document.getElementById('pdf-viewer').style.display = 'block';
  loadPDF(url);
};

document.getElementById('close-pdf').addEventListener('click', () => {
  pdfDoc = null;
  pageNum = 1;

  document.getElementById('search-results').style.display = 'block';
  document.getElementById('pdf-selection').style.display = 'block';
  document.getElementById('pdf-viewer').style.display = 'none';
});


initPDFList();
