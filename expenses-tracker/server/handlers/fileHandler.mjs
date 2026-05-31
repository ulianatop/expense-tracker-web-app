import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

export default class FileHandler {
    // Creates a FileHandler that serves files in filesDir only.
    constructor(filesDir) {
        this.filesDir = path.join(__dirname, filesDir);
    }

    // Handles a request to fetch a file corresponding to req.url
    async handle(req, res) {
        try {
            const filePath = this._getFilePath(req);
            await this._serveFile(filePath, res);
        } catch (err) {
            res.statusCode = err.statusCode || 500;
            res.writeHead(res.statusCode, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                error: err.message
            }));
        }
    }

    // Returns the directory containing all the files that this handler serves
    _getFilesDir() {
        return this.filesDir;
    }

    // Returns the filesystem path for the file corresponding to req.url
    _getFilePath(req) {
        let filePath = req.url;

        // Construct full file path
        const fullPath = path.join(this.filesDir, filePath);

        // Security: Ensure the file is within the designated directory
        const normalizedPath = path.normalize(fullPath);
        if (!normalizedPath.startsWith(this.filesDir)) {
            const e = new Error(`Security: Attempted access outside public directory: ${req.url}`);
            e.statusCode = 404;  // Not Found
            throw e;
        }

        return fullPath;
    }

    // Reads the file at the filePath and serves its contents in res
    async _serveFile(filePath, res) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const ext = path.extname(filePath);
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        } catch (err) {
            console.log(err);
            if (err.code === 'ENOENT' || err.code === 'EISDIR') {
                err.statusCode = 404;  // Not Found
                err.message = 'File not found';
            } else {
                err.statusCode = 500;  // Internal Server Error
            }
            throw err;
        }
    }
}