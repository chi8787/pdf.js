const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = 3010;

app.get('/api/search', async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).json({ error: 'Please type a keyword' });
  }

  const pdfDir = path.join(__dirname, 'pdf_file');
  if (!fs.existsSync(pdfDir)) {
    return res.status(500).json({ error: 'PDF directory does not exist' });
  }

  const files = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
  const results = [];

  for (const file of files) {
    try {
      const filePath = path.join(pdfDir, file);
      const dataBuffer = fs.readFileSync(filePath);
      
      const pagesWithKeyword = await findPagesWithKeyword(dataBuffer, keyword);

      if (pagesWithKeyword.length > 0) {
        results.push({
          fileName: file,
          snippet: `Found "${keyword}" on pages: ${pagesWithKeyword.join(', ')}`,
          pages: pagesWithKeyword
        });
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  if (results.length === 0) {
    return res.json({ message: 'No relevant files found' });
  }

  res.json(results);
});

async function findPagesWithKeyword(buffer, keyword) {
  const pdfData = await pdfParse(buffer);
  const textByPage = pdfData.text.split(/\f/); // Split by form feed (page break)
  const pages = [];

  textByPage.forEach((pageText, index) => {
    if (pageText.toLowerCase().includes(keyword.toLowerCase())) {
      pages.push(index + 1); // Page numbers are 1-based
    }
  });

  return pages;
}

app.get('/api/pdf-files', (req, res) => {
  const pdfDir = path.join(__dirname, 'pdf_file');
  if (!fs.existsSync(pdfDir)) {
    return res.status(500).send('PDF directory does not exist');
  }

  const files = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
  res.json(files);
});

app.use(express.static(path.join(__dirname)));

app.use((req, res) => {
  res.status(404).send('Route does not exist (404)');
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
