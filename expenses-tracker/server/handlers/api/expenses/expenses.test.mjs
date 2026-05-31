import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import { ExpensesAPIHandler } from './expenses.mjs';
import { ExpensesState } from '../../../state/expenses/expenses.mjs';
import CategoriesState from '../../../state/categories/categories.mjs';
import DB from '../../../state/database/db.mjs';

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

describe('ExpensesAPIHandler', () => {
    let db;
    let state;
    let catState;

    beforeEach(async () => {
        db = new DB(dbSuffix);
        await db.dropDB();
        await db.createDB();
        db.connect();
        await db.createTables();
        await db.insertUser('alice', 'hash1');
        state = new ExpensesState(dbSuffix);
        catState = new CategoriesState(dbSuffix);
    });

    afterEach(async () => {
        await state.close();
        await db.close();
        await db.dropDB();
    });

    it('GET /api/expenses returns all transactions', async () => {
        await catState.addCategory('alice', 'Food');
        await state.addTxn('alice', { date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 });
        const handler = new ExpensesAPIHandler(state, vi.fn(), resCreator);
        const res = makeRes();
        await handler.handle({ method: 'GET', url: '/api/expenses', username: 'alice' }, res);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toHaveLength(1);
    });

    it('POST /api/expenses creates a transaction', async () => {
        await catState.addCategory('alice', 'Food');
        const parser = vi.fn().mockResolvedValue({ date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 });
        const handler = new ExpensesAPIHandler(state, parser, resCreator);
        const res = makeRes();
        await handler.handle({ method: 'POST', url: '/api/expenses', username: 'alice' }, res);
        expect(res.statusCode).toBe(200);
        expect(await state.getTxns('alice')).toHaveLength(1);
    });

    it('PUT /api/expenses/:id updates a transaction', async () => {
        await catState.addCategory('alice', 'Food');
        await catState.addCategory('alice', 'Drinks');
        const id = await state.addTxn('alice', { date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 });
        const parser = vi.fn().mockResolvedValue({ date: '2024-01-02', desc: 'Tea', cat: 'Drinks', amt: 3 });
        const handler = new ExpensesAPIHandler(state, parser, resCreator);
        const res = makeRes();
        await handler.handle({ method: 'PUT', url: `/api/expenses/${id}`, username: 'alice' }, res);
        expect(res.statusCode).toBe(200);
        expect((await state.getTxns('alice'))[0]).toMatchObject({ desc: 'Tea', amt: 3 });
    });

    it('DELETE /api/expenses/:id removes the transaction', async () => {
        await catState.addCategory('alice', 'Food');
        const id = await state.addTxn('alice', { date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 });
        const handler = new ExpensesAPIHandler(state, vi.fn(), resCreator);
        const res = makeRes();
        await handler.handle({ method: 'DELETE', url: `/api/expenses/${id}`, username: 'alice' }, res);
        expect(res.statusCode).toBe(200);
        expect(await state.getTxns('alice')).toHaveLength(0);
    });

    it('returns 401 when username is missing', async () => {
        const handler = new ExpensesAPIHandler(state, vi.fn(), resCreator);
        const res = makeRes();
        await handler.handle({ method: 'GET', url: '/api/expenses' }, res);
        expect(res.statusCode).toBe(401);
    });
});