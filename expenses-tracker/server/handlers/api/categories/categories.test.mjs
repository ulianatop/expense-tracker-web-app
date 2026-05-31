import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import { CategoriesAPIHandler } from './categories.mjs';
import DB from '../../../state/database/db.mjs';
import CategoriesState from '../../../state/categories/categories.mjs';

config({ path: new URL('../../../state/database/.env.test', import.meta.url).pathname });
const dbSuffix = `_${randomUUID().replace(/-/g, '')}`;

function makeRes() {
    const res = {};
    res.writeHead = vi.fn();
    res.end = vi.fn(body => { res.body = body; });
    return res;
}

function resCreator(status, body, res) {
    res.statusCode = status;
    res.end(JSON.stringify(body));
}

describe('CategoriesAPIHandler', () => {
    let db;
    let categoriesState;

    beforeEach(async () => {
        db = new DB(dbSuffix);
        await db.dropDB();
        await db.createDB();
        db.connect();
        await db.createTables();
        await db.insertUser('alice', 'hash1');
        categoriesState = new CategoriesState(dbSuffix);
    });

    afterEach(async () => {
        await categoriesState.close();
        await db.close();
        await db.dropDB();
    });

    it('GET /api/categories returns all categories', async () => {
        await categoriesState.addCategory('alice', 'Food');
        const handler = new CategoriesAPIHandler(categoriesState, vi.fn(), resCreator);
        const res = makeRes();
        await handler.handle({ method: 'GET', url: '/api/categories', username: 'alice' }, res);
        expect(res.statusCode).toBe(200);
        const categories = JSON.parse(res.body);
        expect(categories).toHaveLength(1);
        expect(categories[0].cat_name).toEqual('Food');
    });

    it('POST /api/categories creates a category', async () => {
        const parser = vi.fn().mockResolvedValue('Food');
        const handler = new CategoriesAPIHandler(categoriesState, parser, resCreator);
        const res = makeRes();
        await handler.handle({ method: 'POST', url: '/api/categories', username: 'alice' }, res);
        expect(res.statusCode).toBe(200);
        const categories = await categoriesState.listCategories('alice');
        expect(categories).toHaveLength(1);
        expect(categories[0].cat_name).toEqual('Food');
    });

    it('PUT /api/categories/:id updates a category', async () => {
        const id = await categoriesState.addCategory('alice', 'Food');
        const parser = vi.fn().mockResolvedValue('Drinks');
        const handler = new CategoriesAPIHandler(categoriesState, parser, resCreator);
        const res = makeRes();
        await handler.handle({ method: 'PUT', url: `/api/categories/${id}`, username: 'alice' }, res);
        expect(res.statusCode).toBe(200);
        const categories = await categoriesState.listCategories('alice');
        expect(categories).toHaveLength(1);
        expect(categories[0].cat_name).toEqual('Drinks');
    });

    it('DELETE /api/categories/:id removes the category', async () => {
        const id = await categoriesState.addCategory('alice', 'Food');
        const handler = new CategoriesAPIHandler(categoriesState, vi.fn(), resCreator);
        const res = makeRes();
        await handler.handle({ method: 'DELETE', url: `/api/categories/${id}`, username: 'alice' }, res);
        expect(res.statusCode).toBe(200);
        const categories = await categoriesState.listCategories('alice');
        expect(categories).toHaveLength(0);
    });

    it('returns 401 when username is missing', async () => {
        const handler = new CategoriesAPIHandler(categoriesState, vi.fn(), resCreator);
        const res = makeRes();
        await handler.handle({ method: 'GET', url: '/api/categories' }, res);
        expect(res.statusCode).toBe(401);
    });
});
