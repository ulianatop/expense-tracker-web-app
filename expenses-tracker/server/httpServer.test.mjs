import { describe, it, expect } from 'vitest';
import HTTPServer from './httpServer.mjs';
import Router from './router.mjs';

describe('HTTPServer', () => {
    it('starts and assigns a non-zero port when port 0 is given', async () => {
        const server = new HTTPServer(new Router(), 0);
        await server.start();
        expect(server.port).toBeGreaterThan(0);
        await server.stop();
    });

    it('stops cleanly after starting', async () => {
        const server = new HTTPServer(new Router(), 0);
        await server.start();
        await expect(server.stop()).resolves.toBeUndefined();
    });

    it('routes a GET request to the matching handler', async () => {
        const router = new Router();
        let received = null;
        router.addRoute('GET', url => url === '/ping', (req, res) => {
            received = req.url;
            res.writeHead(200);
            res.end('pong');
        });
        const server = new HTTPServer(router, 0);
        await server.start();
        await fetch(`http://127.0.0.1:${server.port}/ping`);
        await server.stop();
        expect(received).toBe('/ping');
    });

    it('returns the response written by the handler', async () => {
        const router = new Router();
        router.addRoute('GET', url => url === '/hello', (_req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('world');
        });
        const server = new HTTPServer(router, 0);
        await server.start();
        const res = await fetch(`http://127.0.0.1:${server.port}/hello`);
        const text = await res.text();
        await server.stop();
        expect(text).toBe('world');
    });
});
