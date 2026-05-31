import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import { ExpensesState } from './expenses.mjs';
import CategoriesState from '../categories/categories.mjs';
import DB from '../database/db.mjs'

config({ path: new URL('../database/.env.test', import.meta.url).pathname });
const dbSuffix = `_${randomUUID().replace(/-/g, '')}`;

describe('ExpensesState', () => {
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
        await db.insertUser('bob', 'hash2');
        state = new ExpensesState(dbSuffix);
        catState = new CategoriesState(dbSuffix);
    });

    afterEach(async () => {
        await state.close();
        await db.close();
        await db.dropDB();
    });

    it('adds a transaction and returns it via getTxns', async () => {
        await catState.addCategory('alice', 'Food');
        await state.addTxn('alice', { date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 });
        const txns = await state.getTxns('alice');
        expect(txns).toHaveLength(1);
        expect(txns[0]).toMatchObject({ desc: 'Coffee', cat: 'Food', amt: 5 });
    });

    it('throws when desc is empty', async () => {
        await expect(state.addTxn('alice', { date: '2024-01-01', desc: '', cat: 'Food', amt: 5 }))
            .rejects.toThrow('description');
    });

    it('throws when cat is empty', async () => {
        await expect(state.addTxn('alice', { date: '2024-01-01', desc: 'Coffee', cat: '', amt: 5 }))
            .rejects.toThrow('category');
    });

    it('throws when amt is not positive', async () => {
        await expect(state.addTxn('alice', { date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: -1 }))
            .rejects.toThrow('positive');
    });

    it('updates an existing transaction', async () => {
        await catState.addCategory('alice', 'Food');
        await catState.addCategory('alice', 'Drinks');
        const id = await state.addTxn('alice', { date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 });
        await state.updateTxn('alice', id, { date: '2024-01-02', desc: 'Tea', cat: 'Drinks', amt: 3 });
        const txns = await state.getTxns('alice');
        expect(txns[0]).toMatchObject({ desc: 'Tea', cat: 'Drinks', amt: 3 });
    });

    it('removes an existing transaction', async () => {
        await catState.addCategory('alice', 'Food');
        const id = await state.addTxn('alice', { date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 });
        await state.removeTxn('alice', id);
        const txns = await state.getTxns('alice');
        expect(txns).toHaveLength(0);
    });
});