import Router from '../../../router.mjs';

export class ExpensesAPIHandler {
    constructor(expensesState, reqParser, resCreator) {
        this.expensesState = expensesState;
        this.reqParser = reqParser;
        this.resCreator = resCreator;

        this.router = new Router();
        this.router.addRoute('POST', url => url === '/api/expenses',
            (req, res) => this.createExpense(req, res));
        this.router.addRoute('GET', url => url === '/api/expenses',
            (req, res) => this.listExpenses(req, res));
        this.router.addRoute('PUT', url => /\/api\/expenses\/\d+/.test(url),
            (req, res) => this.updateExpense(req, res));
        this.router.addRoute('DELETE', url => /\/api\/expenses\/\d+/.test(url),
            (req, res) => this.deleteExpense(req, res));
    }

    async handle(req, res) {
        await this.router.handle(req, res);
    }

    requireUsername(req) {
        if (!req.username) {
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            throw err;
        }
    }

    async createExpense(req, res) {
        try {
            this.requireUsername(req);
            const txn = await this.reqParser(req);
            const id = await this.expensesState.addTxn(req.username, txn);
            this.resCreator(200, { id }, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }

    async listExpenses(req, res) {
        try {
            this.requireUsername(req);
            const txns = await this.expensesState.getTxns(req.username);
            this.resCreator(200, txns, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }

    async updateExpense(req, res) {
        try {
            this.requireUsername(req);
            const id = req.url.match(/\d+/)[0];
            const txn = await this.reqParser(req);
            await this.expensesState.updateTxn(req.username, id, txn);
            this.resCreator(200, {}, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }

    async deleteExpense(req, res) {
        try {
            this.requireUsername(req);
            const id = req.url.match(/\d+/)[0];
            await this.expensesState.removeTxn(req.username, id);
            this.resCreator(200, {}, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }
}