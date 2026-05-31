import { describe, it, expect, vi } from 'vitest';
import { ExpensesController } from './controller.js';

function makeView() {
    return {
        registerAddTxnHandler: vi.fn(),
        registerCancelHandler: vi.fn(),
        registerRemoveTxnHandler: vi.fn(),
        registerEditTxnHandler: vi.fn(),
        renderTxns: vi.fn(),
        getInputValues: vi.fn().mockReturnValue({ date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: '5' }),
        clearInputs: vi.fn(),
        populateInputs: vi.fn(),
        setEditMode: vi.fn(),
    };
}

function makeModel(txns = []) {
    return {
        getTxns: vi.fn().mockResolvedValue(txns),
        addTxn: vi.fn().mockResolvedValue({}),
        updateTxn: vi.fn().mockResolvedValue({}),
        removeTxn: vi.fn().mockResolvedValue({}),
    };
}

function makeCatModel(cats = [
    { cat_id: 0, cat_name: 'Food' },
    { cat_id: 1, cat_name: 'Drink' }]) {
    return {
        getCategories: vi.fn().mockResolvedValue(cats),
    };
}

describe('ExpensesController', () => {
    it('renders transactions on init', async () => {
        const txns = [{ id: 0, date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 }];
        const model = makeModel(txns);
        const view = makeView();
        new ExpensesController(model, view, makeCatModel());
        await vi.waitFor(() => expect(view.renderTxns).toHaveBeenCalledWith(txns));
    });

    it('handleAddTxn calls model.addTxn with view inputs', async () => {
        const model = makeModel();
        const view = makeView();
        const controller = new ExpensesController(model, view, makeCatModel());
        await controller.handleAddTxn();
        expect(model.addTxn).toHaveBeenCalledWith('2024-01-01', 'Coffee', 'Food', '5');
    });

    it('handleAddTxn clears inputs after success', async () => {
        const model = makeModel();
        const view = makeView();
        const controller = new ExpensesController(model, view, makeCatModel());
        await controller.handleAddTxn();
        expect(view.clearInputs).toHaveBeenCalled();
    });

    it('handleCancel resets editingId, clears inputs, and exits edit mode', () => {
        const model = makeModel();
        const view = makeView();
        const controller = new ExpensesController(model, view, makeCatModel());
        controller.editingId = 1;
        controller.handleCancel();
        expect(controller.editingId).toBeNull();
        expect(view.clearInputs).toHaveBeenCalled();
        expect(view.setEditMode).toHaveBeenCalledWith(false);
    });

    it('handleRemoveTxn calls model.removeTxn with the id', async () => {
        const model = makeModel();
        const view = makeView();
        const controller = new ExpensesController(model, view, makeCatModel());
        await controller.handleRemoveTxn(0);
        expect(model.removeTxn).toHaveBeenCalledWith(0);
    });

    it('handleEditTxn sets editingId and populates inputs', async () => {
        const txn = { id: 2, date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 };
        const model = makeModel([txn]);
        const view = makeView();
        const controller = new ExpensesController(model, view, makeCatModel());
        await controller.handleEditTxn(2);
        expect(controller.editingId).toBe(2);
        expect(view.populateInputs).toHaveBeenCalledWith(txn);
        expect(view.setEditMode).toHaveBeenCalledWith(true);
    });

    it('handleSubmit calls handleUpdateTxn when editingId is set', async () => {
        const model = makeModel();
        const view = makeView();
        const controller = new ExpensesController(model, view, makeCatModel());
        controller.editingId = 1;
        const spy = vi.spyOn(controller, 'handleUpdateTxn').mockResolvedValue();
        await controller.handleSubmit();
        expect(spy).toHaveBeenCalled();
    });

    it('handleSubmit calls handleAddTxn when editingId is null', async () => {
        const model = makeModel();
        const view = makeView();
        const controller = new ExpensesController(model, view, makeCatModel());
        const spy = vi.spyOn(controller, 'handleAddTxn').mockResolvedValue();
        await controller.handleSubmit();
        expect(spy).toHaveBeenCalled();
    });
});
