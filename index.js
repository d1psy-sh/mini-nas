"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const formidable = __importStar(require("formidable"));
const path = __importStar(require("path"));
const app = (0, express_1.default)();
// Set up middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Set up file upload with Formidable
app.post('/upload', (req, res) => {
    // NOTE: this is not working right debug here
    const form = new formidable.IncomingForm({
        multiples: true,
        uploadDir: path.join(__dirname, 'db'),
    });
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading files');
            return;
        }
        const uploadedFiles = Array.isArray(files.filepond)
            ? files.filepond
            : [files.filepond];
        const uploadErrors = [];
        uploadedFiles.forEach((file) => {
            const oldPath = file.filepath;
            // if we have a file name we use the filename else we have a problem
            const filename = file.originalFilename
                ? file.originalFilename
                : 'nofilename';
            const newPath = path.join(__dirname, 'db', filename);
            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.error(err);
                    // NOTE: file is not there;
                    // uploadErrors.push(file.);
                    return;
                }
            });
        });
        if (uploadErrors.length > 0) {
            res.status(500).send(`Error uploading files: ${uploadErrors.join(', ')}`);
        }
        else {
            res.send('Files uploaded successfully');
        }
    });
});
// Serve the upload page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});
app.get('/download', (req, res) => {
    // Serve file download
    const fileName = req.url.split('=')[1];
    const filePath = path.join(__dirname, 'db', fileName);
    const fileStream = fs.createReadStream(filePath);
    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-type', 'application/octet-stream');
    fileStream.pipe(res);
});
app.get('/browse', (_, res) => {
    // Serve file browser
    const fileList = fs.readdirSync('./db');
    const fileLinks = fileList.map((file) => `<li><a href="/download?filename=${file}">${file}</a></li>`);
    const fileBrowserHtml = `
      <html>
        <body>
          <h1>Select a file to download:</h1>
          <ul>
            ${fileLinks.join('')}
          </ul>
        </body>
      </html>
    `;
    res.setHeader('Content-type', 'text/html');
    res.end(fileBrowserHtml);
});
// TODO: implement that
app.get('/filepond', (req, res) => {
    // make a new filepond instance
    // upload the file to the server
    // the upload url should be /upload and should be a post request
    // there should be a submit button
    res.sendFile(path.join(__dirname, 'filepond.html'));
});
// Set up static file serving
app.use(express_1.default.static('public'));
// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
