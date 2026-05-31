import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import DB from '../database/db.mjs';
import CategoriesState from './categories.mjs';

config({ path: new URL('../database/.env.test', import.meta.url).pathname });
const dbSuffix = `_${randomUUID().replace(/-/g, '')}`;

describe('CategoriesState', () => {
    let db;
    let categoriesState;

    beforeEach(async () => {
        db = new DB(dbSuffix);
        await db.dropDB();
        await db.createDB();
        db.connect();
        await db.createTables();
        await db.insertUser('alice', 'hash1');
        await db.insertUser('bob', 'hash2');
        categoriesState = new CategoriesState(dbSuffix);
    });

    afterEach(async () => {
        await categoriesState.close();
        await db.close();
        await db.dropDB();
    });

    it('creates a category and returns a result with insertId', async () => {
        const id = await categoriesState.addCategory('alice', 'Food');
        expect(id).toBeGreaterThan(0);
    });

    it('lists all categories for one user', async () => {
        await categoriesState.addCategory('alice', 'Food');
        await categoriesState.addCategory('alice', 'Transport');
        await categoriesState.addCategory('bob', 'Bills');
        const categories = await categoriesState.listCategories('alice');
        expect(categories).toHaveLength(2);
        expect(categories.map(c => c.cat_name)).toEqual(
            expect.arrayContaining(['Food', 'Transport'])
        );
    });

    it('updates a category name', async () => {
        const insertId = await categoriesState.addCategory('alice', 'Misc');
        await categoriesState.updateCategory('alice', insertId, 'Groceries');
        const categories = await categoriesState.listCategories('alice');
        expect(categories[0].cat_name).toBe('Groceries');
    });

    it('throws when updating a non-existent category', async () => {
        await expect(categoriesState.updateCategory('alice', 9999, 'Ghost')).rejects.toThrow('Failed update');
    });

    it('deletes a category', async () => {
        const insertId = await categoriesState.addCategory('alice', 'Food');
        await categoriesState.deleteCategory('alice', insertId);
        const categories = await categoriesState.listCategories('alice');
        expect(categories).toHaveLength(0);
    });

    it('throws when deleting a non-existent category', async () => {
        await expect(categoriesState.deleteCategory('alice', 9999)).rejects.toThrow('Failed delete');
    });
});
