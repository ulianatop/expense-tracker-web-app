import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { UsersState } from './usersState.mjs';
import DB from '../database/db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../database/.env.test') });

const dbSuffix = `_${randomUUID().replace(/-/g, '')}`;

describe('UsersState', () => {
    let db;
    let usersState;

    beforeEach(async () => {
        db = new DB(dbSuffix);
        await db.dropDB();
        await db.createDB();
        db.connect();
        await db.createTables();
        usersState = new UsersState(dbSuffix);
    });

    afterEach(async () => {
        await usersState.close();
        await db.close();
        await db.dropDB();
    });

    it('addUser stores a hashed password', async () => {
        await usersState.addUser('alice', 'password123');
        const user = await db.getUser('alice');
        expect(user.username).toBe('alice');
        expect(user.password_hash).not.toBe('password123');
    });

    it('verifyUser does not throw for a correct password', async () => {
        await usersState.addUser('alice', 'password123');
        await expect(usersState.verifyUser('alice', 'password123')).resolves.toBeUndefined();
    });

    it('verifyUser throws for a wrong password', async () => {
        await usersState.addUser('alice', 'password123');
        await expect(usersState.verifyUser('alice', 'wrongpassword')).rejects.toThrow();
    });
});