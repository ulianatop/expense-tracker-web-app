import DB from '../database/db.mjs'

export default class CategoriesState {
    constructor(dbSuffix = '') {
        this.db = new DB(dbSuffix);
        this.db.connect();
    }

    async close() {
        this.db.close();
    }

    async addCategory(username, name) {
        if (!name || name.trim().length == 0) {
            throw new Error("Category name must not be empty");
        }
        const result = await this.db.insertCategory(username, name);
        return result.insertId;
    }

    async updateCategory(username, id, name) {
        if (!name || name.trim().length == 0) {
            throw new Error("Category name must not be empty");
        }
        const result = await this.db.updateCategory(username, id, name);
        if (result.affectedRows !== 1) {
            throw new Error(`Failed update`);
        }
    }

    async deleteCategory(username, id) {
        const result = await this.db.deleteCategory(username, id);
        if (result.affectedRows !== 1) {
            console.log(result);
            throw new Error(`Failed delete`);
        }
    }

    async listCategories(username) {
        const rows = await this.db.listCategories(username);
        return rows;
    }
}