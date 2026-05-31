import bcrypt from 'bcrypt';
import DB from '../database/db.mjs'

export class UsersState {
    constructor(dbSuffix = '') {
        this.db = new DB(dbSuffix);
        this.db.connect();
    }

    async close() {
        this.db.close();
    }

    async addUser(username, password) {
        if (!username || username.trim().length == 0) {
            throw new Error('Username must not be empty');
        }
        if (!password || password.length == 0) {
            throw new Error('Password must not be empty');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await this.db.insertUser(username, passwordHash);
        return result.insertId;
    }

    async verifyUser(username, password) {
        if (!username || username.trim().length == 0) {
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            throw err;
        }
        if (!password || password.length == 0) {
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            throw err;
        }

        let user;
        try {
            user = await this.db.getUser(username);
        } catch {
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            throw err;
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            throw err;
        }
    }
}