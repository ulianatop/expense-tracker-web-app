import jwt from 'jsonwebtoken';

export class UserExtractor {
    handle(req) {
        if (!req.url.startsWith('/api/categories') && !req.url.startsWith('/api/expenses')) {
            return;
        }

        const authHeader = req.headers?.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            throw err;
        }

        try {
            const token = authHeader.slice(7);
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.username = payload.username;
        } catch (err) {
            err.statusCode = 401;
            throw err;
        }
    }
}