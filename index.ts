import express, { Express, Request, Response } from 'express';
import * as fs from 'fs';
import * as formidable from 'formidable';
import * as path from 'path';
const app: Express = express();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up file upload with Formidable
app.post('/upload', (req: Request, res: Response) => {
    // NOTE: this is not working right debug here
    const form = new formidable.IncomingForm({
        multiples: true,
        uploadDir: path.join(__dirname, 'db'),
    });

    form.parse(req, (err: Error, fields: formidable.Fields, files: any) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading files');
            return;
        }

        const uploadedFiles = Array.isArray(files.filepond)
            ? files.filepond
            : [files.filepond];
        const uploadErrors: Error[] = [];

        uploadedFiles.forEach((file: formidable.File) => {
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
            res.status(500).send(
                `Error uploading files: ${uploadErrors.join(', ')}`
            );
        } else {
            res.send('Files uploaded successfully');
        }
    });
});

// Serve the upload page
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

app.get('/download', (req: Request, res: Response) => {
    // Serve file download
    const fileName = req.url.split('=')[1];
    const filePath = path.join(__dirname, 'db', fileName);
    const fileStream = fs.createReadStream(filePath);
    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-type', 'application/octet-stream');
    fileStream.pipe(res);
});

app.get('/browse', (_, res: Response) => {
    // Serve file browser
    const fileList: string[] = fs.readdirSync('./db');
    const fileLinks: string[] = fileList.map(
        (file) => `<li><a href="/download?filename=${file}">${file}</a></li>`
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
});

// TODO: implement that
app.get('/filepond', (req: Request, res: Response) => {
    // make a new filepond instance
    // upload the file to the server
    // the upload url should be /upload and should be a post request
    // there should be a submit button
    res.sendFile(path.join(__dirname, 'filepond.html'));
});

// Set up static file serving
app.use(express.static('public'));

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
