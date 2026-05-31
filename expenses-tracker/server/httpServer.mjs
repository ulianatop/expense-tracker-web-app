import http from 'http';

export default class HTTPServer {
    constructor(router, port = 0) {
        this.address = '127.0.0.1';
        this.port = port;
        this.server = http.createServer(async (req, res) => {
            try {
                await router.handle(req, res);
            } catch (err) {
                res.statusCode = err.statusCode || 500;
                res.writeHead(res.statusCode, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    error: err.message
                }));
                return;
            }
        });
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, this.address, () => {
                const { port } = this.server.address();
                console.log(`Started server on port ${port}`);
                if (this.port !== port) {
                    // e.g. if no port was specified by the caller
                    this.port = port;
                }
                resolve();
            });

            // Handle event that fires when the server encounters an error.
            this.server.on('error', (err) => reject(err));
        });
    }

    async stop() {
        return new Promise((resolve) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}