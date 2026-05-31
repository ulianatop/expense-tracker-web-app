import { CategoriesModel } from './model.js';
import { CategoriesView } from './view.js';
import { CategoriesController } from './controller.js';
import { UserInfo } from '../users/userInfo.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!UserInfo.getAuthToken()) {
        window.location.href = '/users/login.html';
        return;
    }

    const logoutButton = document.querySelector('#logoutButton');
    logoutButton.addEventListener('click', () => {
        UserInfo.clearAuthToken();
        window.location.href = '/users/login.html';
    });

    const model = new CategoriesModel();
    const view = new CategoriesView();
    new CategoriesController(model, view);
});