import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoriesController } from './controller.js';

function makeMocks() {
    const model = {
        addCategory: vi.fn().mockResolvedValue({}),
        updateCategory: vi.fn().mockResolvedValue({}),
        removeCategory: vi.fn().mockResolvedValue({}),
        getCategories: vi.fn().mockResolvedValue([]),
    };
    const view = {
        registerAddCategoryHandler: vi.fn(),
        registerCancelHandler: vi.fn(),
        registerRemoveCategoryHandler: vi.fn(),
        registerEditCategoryHandler: vi.fn(),
        getInputValues: vi.fn().mockReturnValue({ catName: 'Food' }),
        clearInputs: vi.fn(),
        populateInputs: vi.fn(),
        setEditMode: vi.fn(),
        renderCategories: vi.fn(),
    };
    return { model, view };
}

describe('CategoriesController', () => {
    let model, view, controller;

    beforeEach(() => {
        ({ model, view } = makeMocks());
        global.alert = vi.fn();
        controller = new CategoriesController(model, view);
    });

    describe('constructor', () => {
        it('registers all four view handlers', () => {
            expect(view.registerAddCategoryHandler).toHaveBeenCalledOnce();
            expect(view.registerCancelHandler).toHaveBeenCalledOnce();
            expect(view.registerRemoveCategoryHandler).toHaveBeenCalledOnce();
            expect(view.registerEditCategoryHandler).toHaveBeenCalledOnce();
        });

        it('calls updateView on construction', () => {
            expect(model.getCategories).toHaveBeenCalledOnce();
        });

        it('initialises editingId to null', () => {
            expect(controller.editingId).toBeNull();
        });
    });

    describe('handleSubmit', () => {
        it('calls handleAddCategory when not editing', async () => {
            controller.editingId = null;
            await controller.handleSubmit();
            expect(model.addCategory).toHaveBeenCalledWith('Food');
        });

        it('calls handleUpdateCategory when editingId is set', async () => {
            controller.editingId = 3;
            await controller.handleSubmit();
            expect(model.updateCategory).toHaveBeenCalledWith(3, 'Food');
        });
    });

    describe('handleAddCategory', () => {
        it('adds the category from the input', async () => {
            view.getInputValues.mockReturnValue({ catName: 'Travel' });
            await controller.handleAddCategory();
            expect(model.addCategory).toHaveBeenCalledWith('Travel');
        });

        it('clears inputs after adding', async () => {
            await controller.handleAddCategory();
            expect(view.clearInputs).toHaveBeenCalled();
        });

        it('updates the view after adding', async () => {
            await controller.handleAddCategory();
            // getCategories is called once in constructor, once after add
            expect(model.getCategories).toHaveBeenCalledTimes(2);
        });

        it('alerts when the model throws', async () => {
            model.addCategory.mockRejectedValue(new Error('oops'));
            await controller.handleAddCategory();
            expect(global.alert).toHaveBeenCalledWith('oops');
        });
    });

    describe('handleUpdateCategory', () => {
        beforeEach(() => {
            controller.editingId = 5;
        });

        it('updates the category with the current editingId and input name', async () => {
            view.getInputValues.mockReturnValue({ catName: 'Utilities' });
            await controller.handleUpdateCategory();
            expect(model.updateCategory).toHaveBeenCalledWith(5, 'Utilities');
        });

        it('resets editingId to null after update', async () => {
            await controller.handleUpdateCategory();
            expect(controller.editingId).toBeNull();
        });

        it('clears inputs and exits edit mode after update', async () => {
            await controller.handleUpdateCategory();
            expect(view.clearInputs).toHaveBeenCalled();
            expect(view.setEditMode).toHaveBeenCalledWith(false);
        });

        it('alerts when the model throws', async () => {
            model.updateCategory.mockRejectedValue(new Error('bad update'));
            await controller.handleUpdateCategory();
            expect(global.alert).toHaveBeenCalledWith('bad update');
        });
    });

    describe('handleEditCategory', () => {
        it('sets editingId and populates inputs for the matching category', async () => {
            model.getCategories.mockResolvedValue([
                { cat_id: 7, cat_name: 'Health' },
                { cat_id: 8, cat_name: 'Food' },
            ]);
            await controller.handleEditCategory(7);
            expect(controller.editingId).toBe(7);
            expect(view.populateInputs).toHaveBeenCalledWith({ cat_id: 7, cat_name: 'Health' });
            expect(view.setEditMode).toHaveBeenCalledWith(true);
        });

        it('does nothing to editingId when the id is not found', async () => {
            model.getCategories.mockResolvedValue([{ cat_id: 1, cat_name: 'Food' }]);
            await controller.handleEditCategory(99);
            expect(controller.editingId).toBeNull();
            expect(view.populateInputs).not.toHaveBeenCalled();
        });

        it('alerts when the model throws', async () => {
            model.getCategories.mockRejectedValue(new Error('fetch failed'));
            await controller.handleEditCategory(1);
            expect(global.alert).toHaveBeenCalledWith('fetch failed');
        });
    });

    describe('handleCancel', () => {
        it('resets editingId to null', () => {
            controller.editingId = 4;
            controller.handleCancel();
            expect(controller.editingId).toBeNull();
        });

        it('clears inputs and exits edit mode', () => {
            controller.handleCancel();
            expect(view.clearInputs).toHaveBeenCalled();
            expect(view.setEditMode).toHaveBeenCalledWith(false);
        });
    });

    describe('handleRemoveCategory', () => {
        it('removes the category by id', async () => {
            await controller.handleRemoveCategory(2);
            expect(model.removeCategory).toHaveBeenCalledWith(2);
        });

        it('updates the view after removing', async () => {
            await controller.handleRemoveCategory(2);
            expect(model.getCategories).toHaveBeenCalledTimes(2);
        });

        it('alerts when the model throws', async () => {
            model.removeCategory.mockRejectedValue(new Error('remove failed'));
            await controller.handleRemoveCategory(2);
            expect(global.alert).toHaveBeenCalledWith('remove failed');
        });
    });

    describe('updateView', () => {
        it('renders the categories returned by the model', async () => {
            const cats = [{ cat_id: 1, cat_name: 'Food' }];
            model.getCategories.mockResolvedValue(cats);
            await controller.updateView();
            expect(view.renderCategories).toHaveBeenCalledWith(cats);
        });

        it('alerts when the model throws', async () => {
            model.getCategories.mockRejectedValue('network error');
            await controller.updateView();
            expect(global.alert).toHaveBeenCalledWith('network error');
        });
    });
});
