import express, { Express, Request, Response } from 'express';
import * as fs from 'fs';
import * as formidable from 'formidable';
const app: Express = express();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up file upload with Formidable
app.post('/upload', (req: Request, res: Response) => {
    const form = formidable({ multiples: true, uploadDir: path.join(__dirname, 'uploads') });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading files');
            return;
        }

        const uploadedFiles = Array.isArray(files.filepond) ? files.filepond : [files.filepond];
        const uploadErrors = [];

        uploadedFiles.forEach((file: formidable.File) => {
            const oldPath = file.path;
            const newPath = path.join(__dirname, 'uploads', file.name);

            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.error(err);
                    uploadErrors.push(file.name);
                    return;
                }
            });
        });

        if (uploadErrors.length > 0) {
            res.status(500).send(`Error uploading files: ${uploadErrors.join(', ')}`);
        } else {
            res.send('Files uploaded successfully');
        }
    });
});

// Serve the upload page
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

app.get('/browse', (_, res: Response) => {
    // Serve file browser
    const fileList: string[] = fs.readdirSync('./public');
    const fileLinks: string[] = fileList.map(
        (file) =>
            `<li><a href="/download?filename=${file}">${file}</a></li>`
    );
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

// TODO: implement that
app.get("/filepond", (req: Request, res: Response) => {
        //
}

// Set up static file serving
app.use(express.static('public'));

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});


if (req.url && req.method) {
    if (req.url === '/browse') {
        // Serve file browser
        const fileList: string[] = fs.readdirSync('./public');
        const fileLinks: string[] = fileList.map(
            (file) =>
                `<li><a href="/download?filename=${file}">${file}</a></li>`
        );
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
    } else if (req.url === '/upload') {
        // upload file with upload lib
    } else if (req.url.startsWith('/download')) {
        // Serve file download
        const fileName = req.url.split('=')[1];
        const filePath = path.join(__dirname, 'public', fileName);
        const fileStream = fs.createReadStream(filePath);
        res.setHeader(
            'Content-disposition',
            `attachment; filename=${fileName}`
        );
        res.setHeader('Content-type', 'application/octet-stream');
        fileStream.pipe(res);
    } else if (req.url.toString() === '/') {
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
    } else {
        // Serve 404 Not Found
        res.statusCode = 404;
        res.end('404 Not Found');
    }
} else {
    console.log('No URL');
}
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
