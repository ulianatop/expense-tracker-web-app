export class UserInfo {
    static localStorageKey = 'authToken';

    static getAuthToken() {
        return localStorage.getItem(UserInfo.localStorageKey);
    }

    static setAuthToken(token) {
        localStorage.setItem(UserInfo.localStorageKey, token);
    }

    static clearAuthToken() {
        localStorage.removeItem(UserInfo.localStorageKey);
    }
}