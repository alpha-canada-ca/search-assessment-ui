import {Component, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {DataService} from 'src/app/services/data.service';
import {AuthService} from "../../services/auth.service";
import {Department} from "../admin/admin.component";

export interface UserProfile {
    email:     string;
    firstName: string;
    lastName:  string;
    admin:     boolean;
    department: Department;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements OnInit {
    isSuccess: boolean = false;
    isSubmitted: boolean = false;
    currentTranslation: string | undefined;
    errorMessage: string | undefined;

    form = new UntypedFormGroup({
        username: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
        password: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
    });

    constructor(private activatedRoute: ActivatedRoute, private titleService: Title, private dataService: DataService,
                private router: Router, private translate: TranslateService, private authService: AuthService) {
        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            translate.get('LOGIN.TITLE').subscribe((res: string) => {
                titleService.setTitle(res);
            });
        });
        translate.get('LOGIN.TITLE').subscribe((res: string) => {
            titleService.setTitle(res);
        });
    }

    get c() {
        return this.form.controls;
    }

    ngOnInit() {
        this.currentTranslation = this.translate.currentLang;
        this.translate.get('LOGIN.TITLE').subscribe((res: string) => {
            this.titleService.setTitle(res);
        });

        // This logic now handles the logout flow
        this.activatedRoute.queryParams
            .subscribe(params => {
                if (params['isLogout']) {
                    this.authService.logout();
                    // Force a reload to the clean login page to ensure the header updates correctly
                    window.location.href = `/${this.currentTranslation}/login`;
                }
            });
    }

    submit() {
        this.authService.login({
            email: this.form.value.username,
            password: this.form.value.password
        }).subscribe({
            next: profile => {
                this.isSubmitted = true;
                this.isSuccess = true;
                window.location.href = `/${this.currentTranslation}/list`;
            },
            error: (err) => {
                this.isSuccess = false;

                if (err.status === 0) {
                    // Network or CORS error
                    this.translate.get('LOGIN.SERVER_ERROR_NETWORK').subscribe((res: string) => {
                        this.errorMessage = res;
                    });
                }
                else if (err.status === 401) {
                    // NotAuthorizedException from backend
                    this.translate.get('LOGIN.FORM_ERROR_MESSAGE').subscribe((res: string) => {
                        this.errorMessage = res;
                    });
                }
                else if (err.status === 422) {
                    // Unprocessable entity from backend
                    this.translate.get('LOGIN.SERVER_ERROR_EMAIL').subscribe((res: string) => {
                        this.errorMessage = res;
                    });
                }
                else if (err.status === 400) {
                    // BadRequestException (e.g. validation error)
                    this.translate.get('LOGIN.SERVER_ERROR_EMAIL').subscribe((res: string) => {
                        this.errorMessage = res;
                    });
                }
                else if (err.status === 403) {
                    // Forbidden
                    this.translate.get('LOGIN.SERVER_ERROR_FORBIDDEN').subscribe((res: string) => {
                        this.errorMessage = res;
                    });
                }
                else {
                    // Generic fallback
                    this.translate.get('LOGIN.SERVER_ERROR_FALLBACK').subscribe((res: string) => {
                        this.errorMessage = res;
                    });
                }
            }
        })
    }


}
