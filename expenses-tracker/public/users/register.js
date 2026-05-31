import { UsersModel } from './usersModel.mjs';

document.addEventListener('DOMContentLoaded', () => {
    const model = new UsersModel();
    const form = document.getElementById('registerForm');
    const errorEl = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            await model.register(username, password);
            window.location.href = '/users/login.html';
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });
});