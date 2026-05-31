import { UserInfo } from '../users/userInfo.js';

export class ExpensesModel {
    getAuthHeaders() {
        const token = UserInfo.getAuthToken();
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }

    async addTxn(date, desc, cat, amt) {
        if (!desc || desc.trim().length == 0) {
            throw new Error("Txn description must not be empty");
        }
        if (!cat || cat.trim().length == 0) {
            throw new Error("Txn category must not be empty");
        }
        const amtNum = Number(amt);
        if (isNaN(amtNum) || amtNum <= 0) {
            throw new Error("Txn amount must be positive");
        }
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            },
            body: JSON.stringify({
                date: date,
                desc: desc,
                cat: cat,
                amt: amt
            })
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }


    async updateTxn(id, date, desc, cat, amt) {
        if (!desc || desc.trim().length == 0) {
            throw new Error("Txn description must not be empty");
        }
        if (!cat || cat.trim().length == 0) {
            throw new Error("Txn category must not be empty");
        }
        const amtNum = Number(amt);
        if (isNaN(amtNum) || amtNum <= 0) {
            throw new Error("Txn amount must be positive");
        }
        const res = await fetch(`/api/expenses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            },
            body: JSON.stringify({ date, desc, cat, amt })
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }

    async removeTxn(id) {
        const res = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }

    async getTxns() {
        const res = await fetch(`/api/expenses`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error((await res.json()).error);
        }
        return await res.json();
    }
}