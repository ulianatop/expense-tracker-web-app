import { UserInfo } from '../users/userInfo.js';

export class CategoriesModel {
    getAuthHeaders() {
        const token = UserInfo.getAuthToken();
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }

    async addCategory(catName) {
        if (!catName || catName.trim().length == 0) {
            throw new Error("Category name must not be empty");
        }
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            },
            body: JSON.stringify(catName)
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }


    async updateCategory(catId, catName) {
        if (!catName || catName.trim().length == 0) {
            throw new Error("Category name must not be empty");
        }
        const res = await fetch(`/api/categories/${catId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            },
            body: JSON.stringify(catName)
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }

    async removeCategory(id) {
        const res = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }

    async getCategories() {
        const res = await fetch(`/api/categories`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }
}