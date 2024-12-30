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
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
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

function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}


function loadPDF(url) {
  pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;
    pageNum = 1;
    renderPage(pageNum);
  }).catch((error) => {
    console.error('Error loading PDF:', error);
  });
}

// option list
function initPDFList() {
  fetch('/api/pdf-files')
    .then(response => response.json())
    .then(pdfFiles => {
      const pdfList = document.getElementById('pdf-list');
      pdfFiles.forEach(file => {
        const option = document.createElement('option');
        option.value = `/pdf/${file}`;
        option.textContent = file;
        pdfList.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching PDF list:', error));
}


document.getElementById('open-pdf').addEventListener('click', () => {
  const selectedPDF = document.getElementById('pdf-list').value;
  if (selectedPDF) {
    document.getElementById('pdf-selection').style.display = 'none';
    document.getElementById('pdf-viewer').style.display = 'block';
    loadPDF(selectedPDF);
  } else {
    alert('choose a PDF file!');
  }
});


document.getElementById('close-pdf').addEventListener('click', () => {
  pdfDoc = null;
  pageNum = 1;
  document.getElementById('pdf-selection').style.display = 'block';
  document.getElementById('pdf-viewer').style.display = 'none';
});


document.getElementById('prev').addEventListener('click', onPrevPage);
document.getElementById('next').addEventListener('click', onNextPage);
initPDFList();
