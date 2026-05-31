import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoriesModel } from './model.js';

describe('CategoriesModel', () => {
    let model;

    beforeEach(() => {
        model = new CategoriesModel();
    });

    it('addCategory throws when name is empty', async () => {
        await expect(model.addCategory('')).rejects.toThrow('Category name must not be empty');
    });

    it('addCategory calls fetch POST /api/categories with the category data', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 0 }) });
        await model.addCategory('Food');
        expect(fetch).toHaveBeenCalledWith('/api/categories', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify('Food'),
        }));
    });

    it('updateCategory throws when category name is empty', async () => {
        await expect(model.updateCategory(0, '')).rejects.toThrow('Category name must not be empty');
    });

    it('updateCategory calls fetch PUT /api/categories/:id', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        await model.updateCategory(3, 'Food');
        expect(fetch).toHaveBeenCalledWith('/api/categories/3', expect.objectContaining({ method: 'PUT' }));
    });

    it('removeCategory calls fetch DELETE /api/categories/:id', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        await model.removeCategory(2);
        expect(fetch).toHaveBeenCalledWith('/api/categories/2', expect.objectContaining({ method: 'DELETE', headers: expect.any(Object) }));
    });

    it('getCategories calls fetch GET /api/categories', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
        await model.getCategories();
        expect(fetch).toHaveBeenCalledWith('/api/categories', expect.objectContaining({ headers: expect.any(Object) }));
    });
});
