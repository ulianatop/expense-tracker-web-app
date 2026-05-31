import { UsersModel } from './usersModel.mjs';
import { UserInfo } from './userInfo.js';

document.addEventListener('DOMContentLoaded', () => {
    const model = new UsersModel();
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const result = await model.login(username, password);
            UserInfo.setAuthToken(result.token);
            window.location.href = '/expenses/expenses.html';
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });
});