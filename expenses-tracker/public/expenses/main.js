import { ExpensesModel } from './model.js';
import { ExpensesView } from './view.js';
import { ExpensesController } from './controller.js';
import { CategoriesModel } from '../categories/model.js';
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

    const model = new ExpensesModel();
    const view = new ExpensesView();
    const categoriesModel = new CategoriesModel();
    new ExpensesController(model, view, categoriesModel);
});