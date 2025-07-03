import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly TOKEN_KEY = 'auth_token';

    constructor() {
    }

    setToken(token: string) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    /** Retrieve the token (or null if not set) */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    clearToken() {
        localStorage.removeItem(this.TOKEN_KEY);
    }


}