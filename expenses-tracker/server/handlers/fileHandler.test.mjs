import { describe, it, expect } from 'vitest';
import FileHandler from './fileHandler.mjs';

function makeRes() {
    const res = {};
    res.writeHead = function (code, headers) { res.statusCode = code; res.headers = headers; };
    res.end = function (body) { res.body = body; };
    return res;
}

describe('FileHandler', () => {
    describe('_getFilePath', () => {
        it('throws on path traversal', () => {
            const handler = new FileHandler('.');
            expect(() => handler._getFilePath({ url: '/../../../etc/passwd' })).toThrow();
        });

        it('returns a path containing the requested filename for a valid URL', () => {
            const handler = new FileHandler('.');
            const filePath = handler._getFilePath({ url: '/fileHandler.mjs' });
            expect(filePath).toContain('fileHandler.mjs');
        });
    });

    describe('handle', () => {
        it('serves an existing file with status 200', async () => {
            const handler = new FileHandler('.');
            const res = makeRes();
            await handler.handle({ url: '/fileHandler.mjs' }, res);
            expect(res.statusCode).toBe(200);
        });

        it('sets the correct Content-Type for a .mjs file', async () => {
            const handler = new FileHandler('.');
            const res = makeRes();
            await handler.handle({ url: '/fileHandler.mjs' }, res);
            expect(res.headers['Content-Type']).toBe('text/javascript');
        });

        it('responds with 404 for a non-existent file', async () => {
            const handler = new FileHandler('.');
            const res = makeRes();
            await handler.handle({ url: '/does-not-exist.txt' }, res);
            expect(res.statusCode).toBe(404);
        });

        it('responds with 404 on a path traversal attempt', async () => {
            const handler = new FileHandler('.');
            const res = makeRes();
            await handler.handle({ url: '/../../../etc/passwd' }, res);
            expect(res.statusCode).toBe(404);
        });
    });
});
