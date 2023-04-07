"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const formidable_1 = __importDefault(require("formidable"));
const server = http_1.default.createServer((req, res) => {
    if (req.url && req.method) {
        if (req.url === '/browse') {
            // Serve file browser
            const fileList = fs_1.default.readdirSync('./public');
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
        }
        else if (req.url === '/upload') {
            // Serve file upload form
            const uploadFormHtml = `
<h1>Upload a file</h1>
<input type="file" name="file" />
<br>
<script>
    function uploadFile() {
        // upload a file
        let clientServerOptions = {
                uri: 'http://localhost:3000/upload',
                body: JSON.stringify(file: 'file'),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            request(clientServerOptions, function (error, response) {
                console.log(error,response.body);
                return;
            });
    }
</script>
<button type="submit" onclick=uploadFile()>Upload</button>
<h2> Hope that works</h2>
`;
            res.setHeader('Content-type', 'text/html');
            res.end(uploadFormHtml);
        }
        else if (req.url === '/upload' &&
            req.method.toLowerCase() === 'post') {
            // Handle file upload
            const form = (0, formidable_1.default)({
                multiples: false,
                uploadDir: path_1.default.join(__dirname, 'public'),
            });
            form.parse(req, (err, _, files) => {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.end('Error uploading file');
                    return;
                }
                const uploadedFiles = Array.isArray(files.file)
                    ? files.file
                    : [files.file];
                const uploadErrors = [];
                uploadedFiles.forEach((file) => {
                    const oldPath = file.filepath;
                    if (file.originalFilename) {
                        let fileName = file.originalFilename;
                        const newPath = path_1.default.join(__dirname, 'public', fileName);
                        fs_1.default.rename(oldPath, newPath, (err) => {
                            if (err) {
                                console.error(err);
                                uploadErrors.push(fileName);
                                return;
                            }
                        });
                    }
                });
                res.statusCode = 302;
                res.setHeader('Location', '/browse');
                res.end();
            });
        }
        else if (req.url.startsWith('/download')) {
            // Serve file download
            const fileName = req.url.split('=')[1];
            const filePath = path_1.default.join(__dirname, 'public', fileName);
            const fileStream = fs_1.default.createReadStream(filePath);
            res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-type', 'application/octet-stream');
            fileStream.pipe(res);
        }
        else if (req.url.toString() === '/') {
            let homeHtml = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>File Server</title>
</head>
<body>
    <h1>File Server</h1>
    <h2>Click to browse files</h2>
    <button onclick="window.location.href='/browse'">Browse Files</button>
</body>
</html>
            `;
            res.setHeader('Content-type', 'text/html');
            res.end(homeHtml);
        }
        else {
            // Serve 404 Not Found
            res.statusCode = 404;
            res.end('404 Not Found');
        }
    }
    else {
        console.log('No URL');
    }
});
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
