import mysql from 'mysql2/promise'

export default class DB {
    constructor(dbSuffix = '') {
        this.dbName = `${process.env.MYSQL_DATABASE}${dbSuffix}`;
    }

    async createDB() {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD
        });
        await connection.query(`CREATE DATABASE \`${this.dbName}\``);
        await connection.end();
        console.log(`Created DB ${this.dbName}`);
    }

    async dropDB() {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD
        });
        await connection.query(`DROP DATABASE IF EXISTS \`${this.dbName}\``);
        await connection.end();
    }

    connect() {
        if (!this.connectionPool) {
            this.connectionPool = mysql.createPool({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: this.dbName
            });
        }
    }

    async close() {
        if (this.connectionPool) {
            await this.connectionPool.end();
        }
    }

    async createTables() {
        // Parent tables first, then child tables.
        await this.connectionPool.query(`
            CREATE TABLE users (
                user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL
            )
        `);
        await this.connectionPool.query(`
            CREATE TABLE categories (
                cat_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                cat_name VARCHAR(255) NOT NULL,
                user_id INT UNSIGNED NOT NULL,
                UNIQUE KEY unique_user_category (user_id, cat_name),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        `);
        await this.connectionPool.query(`
            CREATE TABLE expenses (
                txn_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                txn_date DATE NOT NULL,
                txn_desc VARCHAR(255) NOT NULL,
                cat_id INT UNSIGNED NOT NULL,
                txn_amt DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
            )
        `);
    }

    async insertUser(username, passwordHash) {
        const [result] = await this.connectionPool.query(
            `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
            [username, passwordHash]
        );
        return result;
    }

    async getUser(username) {
        const [rows] = await this.connectionPool.query(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        );
        if (rows.length != 1) {
            throw new Error("Failed getUser");
        }
        return rows[0];
    }

    async insertCategory(username, catName) {
        const user = await this.getUser(username);
        const [result] = await this.connectionPool.query(
            `INSERT INTO categories (cat_name, user_id) VALUES (?, ?)`,
            [catName, user.user_id]
        );
        return result;
    }

    async getCategoryName(username, catId) {
        const user = await this.getUser(username);
        const [rows] = await this.connectionPool.query(
            `SELECT * FROM categories WHERE cat_id = ? AND user_id = ?`,
            [catId, user.user_id]
        );
        if (rows.length != 1) {
            throw new Error("Failed getCategoryName");
        }
        return rows[0].cat_name;
    }

    async getCategoryId(username, catName) {
        const user = await this.getUser(username);
        const [rows] = await this.connectionPool.query(
            `SELECT * FROM categories WHERE cat_name = ? AND user_id = ?`,
            [catName, user.user_id]
        );
        if (rows.length != 1) {
            throw new Error("Failed getCategoryId");
        }
        return rows[0].cat_id;
    }

    async listCategories(username) {
        const user = await this.getUser(username);
        const [rows] = await this.connectionPool.query(
            `SELECT * FROM categories WHERE user_id = ? ORDER BY cat_id`,
            [user.user_id]
        );
        return rows;
    }

    async updateCategory(username, catId, newCatName) {
        const user = await this.getUser(username);
        const [result] = await this.connectionPool.query(
            `UPDATE categories SET cat_name = ? WHERE cat_id = ? AND user_id = ?`,
            [newCatName, catId, user.user_id]
        );
        return result;
    }

    async deleteCategory(username, catId) {
        const user = await this.getUser(username);
        const [result] = await this.connectionPool.query(
            `DELETE FROM categories WHERE cat_id = ? AND user_id = ?`,
            [catId, user.user_id]
        );
        return result;
    }

    async insertExpense(date, desc, catId, amt) {
        const [result] = await this.connectionPool.query(
            `INSERT INTO expenses (txn_date, txn_desc, cat_id, txn_amt) VALUES (?, ?, ?, ?)`,
            [date, desc, catId, amt]
        );
        return result;
    }

    async listExpenses(username) {
        const user = await this.getUser(username);
        const [rows] = await this.connectionPool.query(
            `SELECT expenses.*, categories.cat_name
             FROM expenses
             JOIN categories ON expenses.cat_id = categories.cat_id
             WHERE categories.user_id = ?
             ORDER BY expenses.txn_id`,
            [user.user_id]
        );
        return rows;
    }

    async updateExpense(username, txnId, newDate, newDesc, newCatId, newAmt) {
        const user = await this.getUser(username);
        const [result] = await this.connectionPool.query(
            `UPDATE expenses
             JOIN categories current_categories ON expenses.cat_id = current_categories.cat_id
             SET expenses.txn_date = ?, expenses.txn_desc = ?, expenses.cat_id = ?, expenses.txn_amt = ?
             WHERE expenses.txn_id = ? AND current_categories.user_id = ?`,
            [newDate, newDesc, newCatId, newAmt, txnId, user.user_id]
        );
        return result;
    }

    async deleteExpense(username, txnId) {
        const user = await this.getUser(username);
        const [result] = await this.connectionPool.query(
            `DELETE expenses FROM expenses
             JOIN categories ON expenses.cat_id = categories.cat_id
             WHERE expenses.txn_id = ? AND categories.user_id = ?`,
            [txnId, user.user_id]
        );
        return result;
    }
}