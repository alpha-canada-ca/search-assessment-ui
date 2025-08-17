import { Injectable } from "@angular/core";
import {User} from "../components/admin/admin.component";

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly EMAIL = 'email';
    private readonly FIRST_NAME = 'firstName';
    private readonly LAST_NAME = 'lastName';
    private readonly ADMIN = 'isAdmin';
    private readonly DEPARTMENT_ID = 'departmentId';



    constructor() {
    }

    setToken(token: string) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    setEmail(email: string) {
        localStorage.setItem(this.EMAIL, email);
    }

    setFirstName(firstName: string) {
        localStorage.setItem(this.FIRST_NAME, firstName);
    }

    setLastName(lastName: string) {
        localStorage.setItem(this.LAST_NAME, lastName);
    }

    setAdmin(isAdmin: boolean) {
        localStorage.setItem(this.ADMIN, isAdmin.toString());
    }

    setDepartmentId(id: string) {
        localStorage.setItem(this.DEPARTMENT_ID, id);
    }

    /** Retrieve the token (or null if not set) */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getEmail(): string | null {
        return localStorage.getItem(this.EMAIL);
    }

    getFirstName(): string | null {
        return localStorage.getItem(this.FIRST_NAME);
    }

    getLastName(): string | null {
        return localStorage.getItem(this.LAST_NAME);
    }

    isAdmin(): boolean {
        return localStorage.getItem(this.ADMIN) === 'true';
    }

    getDepartmentId(): number | null {
        let id = localStorage.getItem(this.DEPARTMENT_ID);
        if (!id) {
            return null;
        }
        return +id;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    clear() {
        localStorage.clear();
    }


}