import DB from '../database/db.mjs'

export class ExpensesState {
    constructor(dbSuffix = '') {
        this.db = new DB(dbSuffix);
        this.db.connect();
    }

    async close() {
        this.db.close();
    }

    async addTxn(username, txn) {
        if (!txn.desc || txn.desc.trim().length == 0) {
            throw new Error("Txn description must not be empty");
        }
        if (!txn.cat || txn.cat.trim().length == 0) {
            throw new Error("Txn category must not be empty");
        }
        const amtNum = Number(txn.amt);
        if (isNaN(amtNum) || amtNum <= 0) {
            throw new Error("Txn amount must be positive");
        }
        const catId = await this.db.getCategoryId(username, txn.cat);
        const result = await this.db.insertExpense(
            txn.date, txn.desc, catId, txn.amt);
        return result.insertId;
    }

    async updateTxn(username, id, txn) {
        if (!txn.desc || txn.desc.trim().length == 0) {
            throw new Error("Txn description must not be empty");
        }
        if (!txn.cat || txn.cat.trim().length == 0) {
            throw new Error("Txn category must not be empty");
        }
        const amtNum = Number(txn.amt);
        if (isNaN(amtNum) || amtNum <= 0) {
            throw new Error("Txn amount must be positive");
        }
        const catId = await this.db.getCategoryId(username, txn.cat);
        const result = await this.db.updateExpense(
            username, id, txn.date, txn.desc, catId, txn.amt);
        if (result.affectedRows !== 1) {
            throw new Error(`Failed update`);
        }
    }

    async removeTxn(username, id) {
        const result = await this.db.deleteExpense(username, id);
        if (result.affectedRows !== 1) {
            console.log(result);
            throw new Error(`Failed delete`);
        }
    }

    async getTxns(username) {
        const rows = await this.db.listExpenses(username);
        return rows.map((row) => {
            return {
                id: row.txn_id,
                date: row.txn_date,
                desc: row.txn_desc,
                cat: row.cat_name,
                amt: Number(row.txn_amt)
            };
        });
    }
}