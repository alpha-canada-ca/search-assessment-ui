import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    value: string = '';

    constructor() {
    }

    // This is by no means a proper way to log in; a proper user management will be implemented later
    isLoggedIn() {
        const json = localStorage.getItem('loggedIn');
        this.value = json !== null ? JSON.parse(json) : '';
        return this.value === 'true';
    }

    logIn() {
        localStorage.setItem('loggedIn', JSON.stringify('true'));
    }

    logOut() {
        localStorage.removeItem('loggedIn');
    }

}