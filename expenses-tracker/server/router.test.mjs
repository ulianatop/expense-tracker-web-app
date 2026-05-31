import { describe, it, expect, vi } from 'vitest';
import Router from './router.mjs';

function makeRes() {
    return {
        statusCode: null,
        writeHead: vi.fn(function (code) { this.statusCode = code; }),
        end: vi.fn(),
    };
}

describe('Router', () => {
    it('calls the handler for a matching route', async () => {
        const router = new Router();
        const handler = vi.fn();
        router.addRoute('GET', url => url === '/test', handler);
        await router.handle({ method: 'GET', url: '/test' }, makeRes());
        expect(handler).toHaveBeenCalled();
    });

    it('does not call the handler for a non-matching URL', async () => {
        const router = new Router();
        const handler = vi.fn();
        router.addRoute('GET', url => url === '/other', handler);
        await router.handle({ method: 'GET', url: '/test' }, makeRes());
        expect(handler).not.toHaveBeenCalled();
    });

    it('does not call the handler for a non-matching method', async () => {
        const router = new Router();
        const getHandler = vi.fn();
        router.addRoute('GET', url => url === '/test', getHandler);
        await router.handle({ method: 'POST', url: '/test' }, makeRes());
        expect(getHandler).not.toHaveBeenCalled();
    });

    it('only calls the first matching route', async () => {
        const router = new Router();
        const first = vi.fn();
        const second = vi.fn();
        router.addRoute('GET', url => url === '/test', first);
        router.addRoute('GET', url => url === '/test', second);
        await router.handle({ method: 'GET', url: '/test' }, makeRes());
        expect(first).toHaveBeenCalled();
        expect(second).not.toHaveBeenCalled();
    });

    it('calls global middleware on every request', async () => {
        const router = new Router();
        const middleware = vi.fn();
        router.addGlobal(middleware);
        await router.handle({ method: 'GET', url: '/anything' }, makeRes());
        expect(middleware).toHaveBeenCalled();
    });

    it('calls global middleware even when no route matches', async () => {
        const router = new Router();
        const middleware = vi.fn();
        router.addGlobal(middleware);
        await router.handle({ method: 'GET', url: '/no-match' }, makeRes());
        expect(middleware).toHaveBeenCalled();
    });

    it('returns registered routes via _getRoutes', () => {
        const router = new Router();
        router.addRoute('POST', url => url === '/foo', vi.fn());
        expect(router._getRoutes()).toHaveLength(1);
        expect(router._getRoutes()[0].method).toBe('POST');
    });

    it('returns registered globals via _getGlobals', () => {
        const router = new Router();
        const mw = vi.fn();
        router.addGlobal(mw);
        expect(router._getGlobals()).toContain(mw);
    });
});
