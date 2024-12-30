# PDF Viewer with PDF.js

A simple PDF viewer built using **PDF.js**, allowing users to view and navigate PDF files through a web interface. This project demonstrates the integration of PDF.js for rendering PDF files on a webpage, complete with functionalities for file selection, navigation, and responsive design.

---

## Features

- **Load Local PDF Files:** Select and view PDF files from a local directory.
- **Responsive Viewer:** Dynamically resizes to fit the viewport.
- **Page Navigation:** Buttons to navigate between pages (Next/Previous).
- **File Selection:** Dropdown to choose from multiple available PDF files.
- **Favicon Support:** Includes a custom page icon (favicon).

---

## Prerequisites

Make sure you have the following installed on your system:

1. **Node.js**: [Download here](https://nodejs.org/)
2. **Git**: [Download here](https://git-scm.com/)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chi8787/pdf.js
   cd pdf.js
   ```

2. Install dependencies:
   ```bash
   npm install express
   ```

3. Place your PDF files in the `pdf_file` directory.

---

## Usage

1. Start the server:
   ```bash
   node server.js
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Select a PDF file from the dropdown menu and click "OPEN" to view.

---

## Project Structure

```
/pdf_viewer/
├── public/
│   ├── image.png             # tab logo
│   ├── index.html            # frontend
│   ├── runpdf.js             # frontend logic
├── pdf_file/                 # Directory for storing PDF files
│   ├── file1.pdf
│   └── file2.pdf
├── pdfjs-dist/               # PDF.js library files
│   ├── build/pdf.mjs
│   ├── build/pdf.worker.mjs
├── server.js                 # Node.js backend server
└── README.md                 
```

---

## How It Works

1. **Frontend:**
   - Users interact with `index.html`, which includes a dropdown for selecting PDF files and navigation buttons.
   - PDF.js is used to render the selected PDF file into a `<canvas>` element.

2. **Backend:**
   - `server.js` serves static files and provides an API endpoint (`/api/pdf-files`) to list all available PDF files in the `pdf_file` directory.

---

## API Endpoints

### **GET /api/pdf-files**
Returns a list of available PDF files.

#### Response Example:
```json
["file1.pdf", "file2.pdf"]
```

---

## Known Issues

- Large PDF files may take time to load and render.
- Ensure that `pdf.worker.js` is correctly referenced in `runpdf.js`.

---

## Contribution

Feel free to fork this repository, create a new branch, and submit a pull request for any improvements or bug fixes.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgements

- **PDF.js:** [Mozilla's PDF.js](https://mozilla.github.io/pdf.js/) for rendering PDF files in the browser.
- **Node.js:** For creating the server to serve the files.
