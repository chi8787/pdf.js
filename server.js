const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/api/pdf-files', (req, res) => {
  const pdfDir = path.join(__dirname, 'pdf_file');
  fs.readdir(pdfDir, (err, files) => {
    if (err) {
      return res.status(500).send('cannot read file');
    }
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    res.json(pdfFiles);
  });
});

app.get('/pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'pdf_file', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('file noe found');
  }
});

app.listen(PORT, () => {
  console.log(`server: http://localhost:${PORT}`);
});

