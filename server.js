const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const pdfjsLib = require('pdfjs-dist');

const app = express();
const PORT = 3000;

app.get('/api/search', async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).json({ error: 'plz type the keywiord' });
  }

  const pdfDir = path.join(__dirname, 'pdf_file');
  if (!fs.existsSync(pdfDir)) {
    return res.status(500).json({ error: 'PDF not exist' });
  }

  const files = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
  const results = [];

  for (const file of files) {
    try {
      const filePath = path.join(pdfDir, file);
      const dataBuffer = fs.readFileSync(filePath);

      const pagesWithKeyword = await findPagesWithKeyword(dataBuffer, keyword);

      results.push({
        fileName: file,
        snippet: pagesWithKeyword.length > 0 ? `searched! "${keyword}"` : '',
        pages: pagesWithKeyword,
      });
    } catch (error) {
      console.error(`reading ${file} problem:`, error);
    }
  }

  res.json(results);
});

async function findPagesWithKeyword(buffer, keyword) {
  const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');

    if (pageText.includes(keyword)) {
      pages.push(i);
    }
  }

  return pages;
}

app.get('/api/pdf-files', (req, res) => {
  const pdfDir = path.join(__dirname, 'pdf_file');
  if (!fs.existsSync(pdfDir)) {
    return res.status(500).send('PDF doesn\'t exist');
  }

  const files = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
  res.json(files);
});

app.use(express.static(path.join(__dirname)));
app.use((req, res) => {
  res.status(404).send('route not exist (404)');
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
