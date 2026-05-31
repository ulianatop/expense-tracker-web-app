import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import DB from '../../../state/database/db.mjs';
import { UsersState } from '../../../state/users/usersState.mjs';
import { UsersAPIHandler } from './usersHandler.mjs';

config({ path: new URL('../../../state/database/.env.test', import.meta.url).pathname });
const dbSuffix = `_${randomUUID().replace(/-/g, '')}`;

function makeRes() {
    const res = {};
    res.writeHead = vi.fn();
    res.end = vi.fn(body => { res.body = body; });
    return res;
}

function resCreator(status, body, res) {
    res.statusCode = status;
    res.end(JSON.stringify(body));
}

describe('UsersAPIHandler', () => {
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

    it('POST /api/users registers a user', async () => {
        const parser = vi.fn().mockResolvedValue({ username: 'alice', password: 'password123' });
        const handler = new UsersAPIHandler(usersState, parser, resCreator);
        const res = makeRes();
        await handler.handle({ method: 'POST', url: '/api/users' }, res);
        expect(res.statusCode).toBe(200);
        const user = await db.getUser('alice');
        expect(user.username).toBe('alice');
    });

    it('POST /api/users/login returns a jwt token', async () => {
        await usersState.addUser('alice', 'password123');
        const parser = vi.fn().mockResolvedValue({ username: 'alice', password: 'password123' });
        const handler = new UsersAPIHandler(usersState, parser, resCreator);
        const res = makeRes();
        await handler.handle({ method: 'POST', url: '/api/users/login' }, res);
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        const payload = jwt.verify(body.token, process.env.JWT_SECRET);
        expect(payload.username).toBe('alice');
    });

    it('POST /api/users/login returns 401 for bad credentials', async () => {
        await usersState.addUser('alice', 'password123');
        const parser = vi.fn().mockResolvedValue({ username: 'alice', password: 'wrong' });
        const handler = new UsersAPIHandler(usersState, parser, resCreator);
        const res = makeRes();
        await handler.handle({ method: 'POST', url: '/api/users/login' }, res);
        expect(res.statusCode).toBe(401);
    });
});