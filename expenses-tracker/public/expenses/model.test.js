import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpensesModel } from './model.js';

describe('ExpensesModel', () => {
    let model;

    beforeEach(() => {
        model = new ExpensesModel();
    });

    it('addTxn throws when desc is empty', async () => {
        await expect(model.addTxn('2024-01-01', '', 'Food', 5)).rejects.toThrow('description');
    });

    it('addTxn throws when cat is empty', async () => {
        await expect(model.addTxn('2024-01-01', 'Coffee', '', 5)).rejects.toThrow('category');
    });

    it('addTxn throws when amt is not positive', async () => {
        await expect(model.addTxn('2024-01-01', 'Coffee', 'Food', -1)).rejects.toThrow('positive');
    });

    it('addTxn throws when amt is NaN', async () => {
        await expect(model.addTxn('2024-01-01', 'Coffee', 'Food', 'abc')).rejects.toThrow('positive');
    });

    it('addTxn calls fetch POST /api/expenses with the txn data', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            { ok: true, json: () => Promise.resolve({ id: 0 }) });
        await model.addTxn('2024-01-01', 'Coffee', 'Food', 5);
        expect(fetch).toHaveBeenCalledWith('/api/expenses', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 }),
        }));
    });

    it('updateTxn throws when desc is empty', async () => {
        await expect(model.updateTxn(0, '2024-01-01', '', 'Food', 5)).rejects.toThrow('description');
    });

    it('updateTxn calls fetch PUT /api/expenses/:id', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        await model.updateTxn(3, '2024-01-01', 'Coffee', 'Food', 5);
        expect(fetch).toHaveBeenCalledWith('/api/expenses/3', expect.objectContaining({ method: 'PUT' }));
    });

    it('removeTxn calls fetch DELETE /api/expenses/:id', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        await model.removeTxn(2);
        expect(fetch).toHaveBeenCalledWith('/api/expenses/2', expect.objectContaining({ method: 'DELETE', headers: expect.any(Object) }));
    });

    it('getTxns calls fetch GET /api/expenses', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
        await model.getTxns();
        expect(fetch).toHaveBeenCalledWith('/api/expenses', expect.objectContaining({ headers: expect.any(Object) }));
    });
});
