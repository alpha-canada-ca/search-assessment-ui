import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, finalize, Observable, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {StorageService} from './storage.service';
import {environment} from "../../environments/environment";
import {DataService} from "./data.service";
import {UserProfile} from "../components/login/login.component";

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


@Injectable({providedIn: 'root'})
export class AuthService {
    private readonly LOGIN_URL = environment.ANALYSIS_API_URL + '/auth/login';
    private readonly LOGOUT_URL = environment.ANALYSIS_API_URL + '/auth/logout';

    private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
    public userProfile$ = this.userProfileSubject.asObservable();

    private authCheckInProgress = new BehaviorSubject<boolean>(true);
    public isAuthCheckInProgress$ = this.authCheckInProgress.asObservable();



    constructor(
        private http: HttpClient,
        private storage: StorageService,
        private dataService: DataService
    ) {
        this.loadInitialProfile();
    }

    private loadInitialProfile(): void {
        if (this.storage.getToken()) {
            this.dataService.getMe().pipe(
                tap(profile => {
                    if (profile) {
                        this.userProfileSubject.next(profile);
                    }
                }),
                catchError(() => {
                    this.logout();
                    return of(null);
                }),
                // 2. This will run whether the API call succeeds or fails
                finalize(() => {
                    this.authCheckInProgress.next(false);
                })
            ).subscribe();
        } else {
            // 3. If there's no token, we're not loading anymore
            this.authCheckInProgress.next(false);
        }
    }


    /**
     * Perform login against the backend, store token on success.
     * @param creds { email, password }
     * @returns Observable that completes when token is stored
     */
    login(creds: LoginRequest): Observable<UserProfile> {
        return this.http.post<LoginResponse>(this.LOGIN_URL, creds).pipe(
            // store the token immediately
            tap(resp => this.storage.setToken(resp.token)),

            // now *wait* for the profile call before emitting
            switchMap(() => this.dataService.getMe()),

            // when the profile arrives, stash the fields
            tap(profile => {
                this.storage.setEmail(profile.email);
                this.storage.setFirstName(profile.firstName);
                this.storage.setLastName(profile.lastName);
                this.storage.setDepartmentId(profile.department.id.toString());
                this.storage.setAdmin(profile.admin);

                this.userProfileSubject.next(profile);
            })
        );
    }

    /**
     * Log out by clearing the stored token
     */
    logout(): void {
        this.http.delete(this.LOGOUT_URL).subscribe();;
        this.storage.clear();
        this.userProfileSubject.next(null);
    }

    public get currentUserProfileValue(): UserProfile | null {
        return this.userProfileSubject.value;
    }

}