import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoriesView } from './view.js';

function setupDOM() {
    document.body.innerHTML = `
        <input id="catName" />
        <div id="catList"></div>
        <button id="addButton">Add Category</button>
        <button id="cancelButton" style="display:none">Cancel</button>
    `;
}

describe('CategoriesView', () => {
    let view;

    beforeEach(() => {
        setupDOM();
        view = new CategoriesView();
    });

    describe('renderCategories', () => {
        it('shows empty message when no categories', () => {
            view.renderCategories([]);
            expect(document.querySelector('#catList').innerHTML).toBe('<p>No categories yet.</p>');
        });

        it('renders a table row for each category', () => {
            view.renderCategories([
                { cat_id: 1, cat_name: 'Food' },
                { cat_id: 2, cat_name: 'Travel' },
            ]);
            const rows = document.querySelectorAll('#catList tbody tr');
            expect(rows).toHaveLength(2);
        });

        it('renders the category name in each row', () => {
            view.renderCategories([{ cat_id: 1, cat_name: 'Food' }]);
            expect(document.querySelector('#catList tbody td').textContent).toBe('Food');
        });

        it('renders edit and remove buttons with the correct data-id', () => {
            view.renderCategories([{ cat_id: 42, cat_name: 'Utilities' }]);
            const editBtn = document.querySelector('.edit-btn');
            const removeBtn = document.querySelector('.remove-btn');
            expect(editBtn.dataset.id).toBe('42');
            expect(removeBtn.dataset.id).toBe('42');
        });
    });

    describe('getInputValues', () => {
        it('returns the current value of the name input', () => {
            document.querySelector('#catName').value = 'Entertainment';
            expect(view.getInputValues()).toEqual({ catName: 'Entertainment' });
        });
    });

    describe('clearInputs', () => {
        it('clears the name input', () => {
            document.querySelector('#catName').value = 'Something';
            view.clearInputs();
            expect(document.querySelector('#catName').value).toBe('');
        });
    });

    describe('populateInputs', () => {
        it('sets the name input to the category name', () => {
            view.populateInputs({ cat_name: 'Health' });
            expect(document.querySelector('#catName').value).toBe('Health');
        });
    });

    describe('setEditMode', () => {
        it('changes button text and shows cancel when editing', () => {
            view.setEditMode(true);
            expect(document.querySelector('#addButton').textContent).toBe('Update Category');
            expect(document.querySelector('#cancelButton').style.display).toBe('inline');
        });

        it('restores button text and hides cancel when not editing', () => {
            view.setEditMode(false);
            expect(document.querySelector('#addButton').textContent).toBe('Add Category');
            expect(document.querySelector('#cancelButton').style.display).toBe('none');
        });
    });

    describe('registerAddCategoryHandler', () => {
        it('calls the handler when the add button is clicked', () => {
            const handler = vi.fn();
            view.registerAddCategoryHandler(handler);
            document.querySelector('#addButton').click();
            expect(handler).toHaveBeenCalledOnce();
        });
    });

    describe('registerCancelHandler', () => {
        it('calls the handler when the cancel button is clicked', () => {
            const handler = vi.fn();
            view.registerCancelHandler(handler);
            document.querySelector('#cancelButton').click();
            expect(handler).toHaveBeenCalledOnce();
        });
    });

    describe('registerRemoveCategoryHandler', () => {
        it('calls the handler with the category id when a remove button is clicked', () => {
            view.renderCategories([{ cat_id: 5, cat_name: 'Food' }]);
            const handler = vi.fn();
            view.registerRemoveCategoryHandler(handler);
            document.querySelector('.remove-btn').click();
            expect(handler).toHaveBeenCalledWith(5);
        });

        it('does not call the handler when a non-remove element in the list is clicked', () => {
            view.renderCategories([{ cat_id: 5, cat_name: 'Food' }]);
            const handler = vi.fn();
            view.registerRemoveCategoryHandler(handler);
            document.querySelector('#catList table').click();
            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('registerEditCategoryHandler', () => {
        it('calls the handler with the category id when an edit button is clicked', () => {
            view.renderCategories([{ cat_id: 7, cat_name: 'Travel' }]);
            const handler = vi.fn();
            view.registerEditCategoryHandler(handler);
            document.querySelector('.edit-btn').click();
            expect(handler).toHaveBeenCalledWith(7);
        });

        it('does not call the handler when a non-edit element in the list is clicked', () => {
            view.renderCategories([{ cat_id: 7, cat_name: 'Travel' }]);
            const handler = vi.fn();
            view.registerEditCategoryHandler(handler);
            document.querySelector('#catList table').click();
            expect(handler).not.toHaveBeenCalled();
        });
    });
});
