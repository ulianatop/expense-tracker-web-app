export class ExpensesView {
    constructor() {
        this.txnDateInput = document.querySelector('#txnDate');
        this.txnDescInput = document.querySelector('#txnDesc');
        this.txnCatInput = document.querySelector('#txnCat');
        this.txnAmtInput = document.querySelector('#txnAmt');
        this.txnList = document.querySelector('#txnList');
        this.addButton = document.querySelector('#addButton');
        this.cancelButton = document.querySelector('#cancelButton');

        this.txnDateInput.value = new Date().toISOString().split('T')[0];
    }

    populateCategories(cats) {
        this.txnCatInput.innerHTML = '';
        cats.forEach(cat => {
            const newOption = new Option(cat.cat_name, cat.cat_name);
            this.txnCatInput.add(newOption);
        });
    }

    renderTxns(txns) {
        if (txns.length === 0) {
            this.txnList.innerHTML = '<p>No transactions yet.</p>';
            return;
        }

        const rows = txns.map((txn) => `
            <tr>
                <td>${txn.date.split('T')[0]}</td>
                <td>${txn.desc}</td>
                <td>${txn.cat}</td>
                <td>${txn.amt}</td>
                <td>
                    <button class="edit-btn" data-id="${txn.id}">Edit</button>
                    <button class="remove-btn" data-id="${txn.id}">Remove</button>
                </td>
            </tr>
        `).join('');

        this.txnList.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    getInputValues() {
        return {
            date: this.txnDateInput.value,
            desc: this.txnDescInput.value,
            cat: this.txnCatInput.value,
            amt: this.txnAmtInput.value
        };
    }

    clearInputs() {
        this.txnDateInput.value = new Date().toISOString().split('T')[0];
        this.txnDescInput.value = '';
        this.txnCatInput.value = '';
        this.txnAmtInput.value = '';
    }

    populateInputs(txn) {
        this.txnDateInput.value = txn.date;
        this.txnDescInput.value = txn.desc;
        this.txnCatInput.value = txn.cat;
        this.txnAmtInput.value = txn.amt;
    }

    setEditMode(editing) {
        this.addButton.textContent = editing ? 'Update Transaction' : 'Add Transaction';
        this.cancelButton.style.display = editing ? 'inline' : 'none';
    }

    registerAddTxnHandler(handler) {
        this.addButton.addEventListener('click', handler);
    }

    registerCancelHandler(handler) {
        this.cancelButton.addEventListener('click', handler);
    }

    registerRemoveTxnHandler(handler) {
        this.txnList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-btn')) {
                const id = parseInt(event.target.dataset.id);
                handler(id);
            }
        });
    }

    registerEditTxnHandler(handler) {
        this.txnList.addEventListener('click', (event) => {
            if (event.target.classList.contains('edit-btn')) {
                const id = parseInt(event.target.dataset.id);
                handler(id);
            }
        });
    }
}
