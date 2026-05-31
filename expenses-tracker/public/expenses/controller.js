export class ExpensesController {
    constructor(expensesModel, expensesView, categoriesModel) {
        this.expensesModel = expensesModel;
        this.expensesView = expensesView;
        this.categoriesModel = categoriesModel;
        this.editingId = null;

        // Register event handlers with the view.
        // Needs closure over `this`.
        this.expensesView.registerAddTxnHandler(() => this.handleSubmit());
        this.expensesView.registerCancelHandler(() => this.handleCancel());
        this.expensesView.registerRemoveTxnHandler((id) => this.handleRemoveTxn(id));
        this.expensesView.registerEditTxnHandler((id) => this.handleEditTxn(id));

        // Initial render
        this.updateView();
    }

    async handleSubmit() {
        if (this.editingId !== null) {
            await this.handleUpdateTxn();
        } else {
            await this.handleAddTxn();
        }
    }

    async handleAddTxn() {
        const { date, desc, cat, amt } = this.expensesView.getInputValues();
        try {
            await this.expensesModel.addTxn(date, desc, cat, amt);
            this.expensesView.clearInputs();
            await this.updateView();
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    async handleUpdateTxn() {
        const { date, desc, cat, amt } = this.expensesView.getInputValues();
        try {
            await this.expensesModel.updateTxn(this.editingId, date, desc, cat, amt);
            this.editingId = null;
            this.expensesView.clearInputs();
            this.expensesView.setEditMode(false);
            await this.updateView();
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    async handleEditTxn(id) {
        try {
            const txns = await this.expensesModel.getTxns();
            const txn = txns.find(t => t.id === id);
            if (txn) {
                this.editingId = id;
                this.expensesView.populateInputs(txn);
                this.expensesView.setEditMode(true);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    handleCancel() {
        this.editingId = null;
        this.expensesView.clearInputs();
        this.expensesView.setEditMode(false);
    }

    async handleRemoveTxn(id) {
        try {
            await this.expensesModel.removeTxn(id);
            await this.updateView();
        } catch (error) {
            alert(error.message);
        }
    }

    async updateView() {
        try {
            const txns = await this.expensesModel.getTxns();
            this.expensesView.renderTxns(txns);
            const cats = await this.categoriesModel.getCategories();
            this.expensesView.populateCategories(cats);
        } catch (err) {
            alert(err);
        }
    }
}
