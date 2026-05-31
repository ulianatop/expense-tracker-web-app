import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { UserExtractor } from './userExtractor.mjs';

config({ path: new URL('../../state/database/.env.test', import.meta.url).pathname });

describe('UserExtractor', () => {
    it('sets req.username when the token is valid', () => {
        const token = jwt.sign({ username: 'alice' }, process.env.JWT_SECRET);
        const extractor = new UserExtractor();
        const req = {
            url: '/api/expenses',
            headers: {
                authorization: `Bearer ${token}`
            }
        };
        extractor.handle(req);
        expect(req.username).toBe('alice');
    });

    it('does not set req.username for routes other than expenses and categories', () => {
        const token = jwt.sign({ username: 'alice' }, process.env.JWT_SECRET);
        const extractor = new UserExtractor();
        const req = {
            url: '/api/users/login',
            headers: {
                authorization: `Bearer ${token}`
            }
        };
        extractor.handle(req);
        expect(req.username).toBeUndefined();
    });

    it('throws when token is missing', () => {
        const extractor = new UserExtractor();
        const req = {
            url: '/api/categories',
            headers: {}
        };
        expect(() => extractor.handle(req)).toThrow();
    });

    it('throws when token is invalid', () => {
        const extractor = new UserExtractor();
        const req = {
            url: '/api/expenses',
            headers: {
                authorization: 'Bearer badtoken'
            }
        };
        expect(() => extractor.handle(req)).toThrow();
    });
});