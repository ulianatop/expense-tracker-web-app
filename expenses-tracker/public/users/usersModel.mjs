export class UsersModel {
    async register(username, password) {
        if (!username || username.trim().length == 0) {
            throw new Error('Username must not be empty');
        }
        if (!password || password.length == 0) {
            throw new Error('Password must not be empty');
        }
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }

    async login(username, password) {
        if (!username || username.trim().length == 0) {
            throw new Error('Username must not be empty');
        }
        if (!password || password.length == 0) {
            throw new Error('Password must not be empty');
        }
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }
}