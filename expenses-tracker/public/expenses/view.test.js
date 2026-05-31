import { describe, it, expect, beforeEach } from 'vitest';
import { ExpensesView } from './view.js';

function setupDOM() {
    document.body.innerHTML = `
        <input id="txnDate" />
        <input id="txnDesc" />
        <input id="txnCat" />
        <input id="txnAmt" />
        <div id="txnList"></div>
        <button id="addButton">Add Transaction</button>
        <button id="cancelButton" style="display:none">Cancel</button>
    `;
}

describe('ExpensesView', () => {
    let view;

    beforeEach(() => {
        setupDOM();
        view = new ExpensesView();
    });

    it('defaults the date input to today', () => {
        const today = new Date().toISOString().split('T')[0];
        expect(document.querySelector('#txnDate').value).toBe(today);
    });

    it('renders a table when transactions exist', () => {
        view.renderTxns([{ id: 0, date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 }]);
        expect(document.querySelector('table')).not.toBeNull();
        expect(document.querySelectorAll('tbody tr')).toHaveLength(1);
    });

    it('renders one row per transaction', () => {
        view.renderTxns([
            { id: 0, date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 },
            { id: 1, date: '2024-01-02', desc: 'Lunch', cat: 'Food', amt: 12 },
        ]);
        expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
    });

    it('renders an empty message when there are no transactions', () => {
        view.renderTxns([]);
        expect(document.querySelector('#txnList').innerHTML).toContain('No transactions');
        expect(document.querySelector('table')).toBeNull();
    });

    it('getInputValues returns current field values', () => {
        document.querySelector('#txnDesc').value = 'Lunch';
        document.querySelector('#txnCat').value = 'Food';
        document.querySelector('#txnAmt').value = '12';
        const vals = view.getInputValues();
        expect(vals.desc).toBe('Lunch');
        expect(vals.cat).toBe('Food');
        expect(vals.amt).toBe('12');
    });

    it('clearInputs resets desc, cat, and amt, and resets date to today', () => {
        document.querySelector('#txnDesc').value = 'Lunch';
        view.clearInputs();
        expect(document.querySelector('#txnDesc').value).toBe('');
        const today = new Date().toISOString().split('T')[0];
        expect(document.querySelector('#txnDate').value).toBe(today);
    });

    it('populateInputs fills all fields from a transaction', () => {
        view.populateInputs({ date: '2024-01-01', desc: 'Coffee', cat: 'Food', amt: 5 });
        expect(document.querySelector('#txnDesc').value).toBe('Coffee');
        expect(document.querySelector('#txnCat').value).toBe('Food');
        expect(document.querySelector('#txnAmt').value).toBe('5');
    });

    it('setEditMode(true) updates button text and shows cancel', () => {
        view.setEditMode(true);
        expect(document.querySelector('#addButton').textContent).toBe('Update Transaction');
        expect(document.querySelector('#cancelButton').style.display).toBe('inline');
    });

    it('setEditMode(false) restores button text and hides cancel', () => {
        view.setEditMode(true);
        view.setEditMode(false);
        expect(document.querySelector('#addButton').textContent).toBe('Add Transaction');
        expect(document.querySelector('#cancelButton').style.display).toBe('none');
    });
});
