import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import DB from './db.mjs';

config({ path: new URL('.env.test', import.meta.url).pathname });
const dbSuffix = `_${randomUUID().replace(/-/g, '')}`;

describe('DB', () => {
    let db;

    beforeEach(async () => {
        db = new DB(dbSuffix);
        await db.dropDB();
        await db.createDB();
        db.connect();
        await db.createTables();
        await db.insertUser('alice', 'hash1');
        await db.insertUser('bob', 'hash2');
    });

    afterEach(async () => {
        await db.close();
        await db.dropDB();
    });

    describe('users', () => {
        it('gets a user by username', async () => {
            const user = await db.getUser('alice');
            expect(user.username).toBe('alice');
            expect(user.password_hash).toBe('hash1');
        });

        it('throws when getting a non-existent user', async () => {
            await expect(db.getUser('nobody')).rejects.toThrow();
        });
    });

    describe('categories', () => {
        it('inserts a category and returns a result with insertId', async () => {
            const result = await db.insertCategory('alice', 'Food');
            expect(result.insertId).toBeGreaterThan(0);
        });

        it('lists only the categories for one user', async () => {
            await db.insertCategory('alice', 'Food');
            await db.insertCategory('bob', 'Transport');
            const categories = await db.listCategories('alice');
            expect(categories).toHaveLength(1);
            expect(categories[0].cat_name).toBe('Food');
        });

        it('updates a category name', async () => {
            const { insertId } = await db.insertCategory('alice', 'Misc');
            await db.updateCategory('alice', insertId, 'Groceries');
            const categories = await db.listCategories('alice');
            expect(categories[0].cat_name).toBe('Groceries');
        });

        it('deletes a category', async () => {
            const { insertId } = await db.insertCategory('alice', 'Food');
            await db.deleteCategory('alice', insertId);
            const categories = await db.listCategories('alice');
            expect(categories).toHaveLength(0);
        });
    });

    describe('expenses', () => {
        let catId;

        beforeEach(async () => {
            const result = await db.insertCategory('alice', 'Food');
            catId = result.insertId;
        });

        it('inserts an expense and returns a result with insertId', async () => {
            const result = await db.insertExpense('2024-01-15', 'Lunch', catId, 12.50);
            expect(result.insertId).toBeGreaterThan(0);
        });

        it('lists only expenses for one user', async () => {
            await db.insertExpense('2024-01-15', 'Lunch', catId, 12.50);
            const { insertId: bobCatId } = await db.insertCategory('bob', 'Food');
            await db.insertExpense('2024-01-16', 'Dinner', bobCatId, 25.00);
            const expenses = await db.listExpenses('alice');
            expect(expenses).toHaveLength(1);
            expect(expenses[0].txn_desc).toBe('Lunch');
        });

        it('updates an expense', async () => {
            await db.insertCategory('alice', 'Drinks');
            const newCatId = await db.getCategoryId('alice', 'Drinks');
            const { insertId } = await db.insertExpense('2024-01-15', 'Lunch', catId, 12.50);
            await db.updateExpense('alice', insertId, '2024-01-16', 'Fancy Lunch', newCatId, 20.00);
            const expenses = await db.listExpenses('alice');
            expect(expenses[0].txn_desc).toBe('Fancy Lunch');
            expect(parseFloat(expenses[0].txn_amt)).toBe(20.00);
        });

        it('deletes an expense', async () => {
            const { insertId } = await db.insertExpense('2024-01-15', 'Lunch', catId, 12.50);
            await db.deleteExpense('alice', insertId);
            const expenses = await db.listExpenses('alice');
            expect(expenses).toHaveLength(0);
        });
    });
});