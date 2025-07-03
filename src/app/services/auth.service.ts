import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import {environment} from "../../environments/environment";

/**
 * Payload for login requests
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Response from login endpoint
 */
export interface LoginResponse {
    token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly LOGIN_URL = environment.ANALYSIS_API_URL + '/auth/login';
    private readonly LOGOUT_URL = environment.ANALYSIS_API_URL + '/auth/logout';

    constructor(
        private http: HttpClient,
        private storage: StorageService
    ) {}

    /**
     * Perform login against the backend, store token on success.
     * @param creds { email, password }
     * @returns Observable that completes when token is stored
     */
    login(creds: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.LOGIN_URL, creds)
            .pipe(
                tap(response => {
                    this.storage.setToken(response.token);
                }),
                // map to void to hide internal response shape
                tap(() => {})
            );
    }

    /**
     * Log out by clearing the stored token
     */
    logout(): void {
        this.http.delete(this.LOGOUT_URL);
        this.storage.clearToken();
    }
}