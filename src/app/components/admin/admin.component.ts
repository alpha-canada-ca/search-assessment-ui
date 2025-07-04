import {Component, OnInit, ViewChild} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Title} from "@angular/platform-browser";
import {ActivatedRoute} from '@angular/router';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {DataService} from 'src/app/services/data.service';
import {Subject} from "rxjs";

const urlReg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

export interface Department {
    id: number;
    nameEn: string;
    nameFr: string;
    acronymEn: string;
    acronymFr: string;
    searchUrlEn: string;
    searchUrlFr: string;
}

export interface User {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    admin: boolean;
    department: Department;
}

export interface UserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    admin: boolean;
    departmentId: number;
}

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css'],
    standalone: false
})
export class AdminComponent implements OnInit {

    departments: Department[];
    department!: Department;
    users: User[];
    user!: UserRequest;
    isDeptSuccess: boolean = false;
    isDeptSubmitted: boolean = false;
    deptErrorMessage: string | undefined;
    isUserSuccess: boolean = false;
    isUserSubmitted: boolean = false;
    userErrorMessage: string | undefined;

    currentTranslation: string | undefined;

    deptForm = new UntypedFormGroup({
        nameEn: new UntypedFormControl('', [Validators.required, Validators.minLength(10)]),
        nameFr: new UntypedFormControl('', [Validators.required, Validators.minLength(10)]),
        acronymEn: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
        acronymFr: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
        urlEn: new UntypedFormControl('', Validators.pattern(urlReg)),
        urlFr: new UntypedFormControl('', Validators.pattern(urlReg))
    });

    userForm = new UntypedFormGroup({
        email: new UntypedFormControl('', [Validators.required, Validators.email]),
        password: new UntypedFormControl('', [Validators.required, Validators.minLength(8)]),
        firstName: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
        lastName: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
        departmentId: new UntypedFormControl(null, [Validators.required]),
        isAdmin: new UntypedFormControl(false)
    });


    ds: DataService;

    constructor(titleService: Title, dataService: DataService, private translate: TranslateService, private route: ActivatedRoute) {
        this.ds = dataService;
        translate.get('ADMIN.TITLE').subscribe((res: string) => {
            titleService.setTitle(res);
        });

        this.departments = this.route.snapshot.data['departments'];
        this.users = this.route.snapshot.data['users'];

        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            translate.get('ADMIN.TITLE').subscribe((res: string) => {
                titleService.setTitle(res);
            });
        });
    }

    ngOnInit() {
        this.currentTranslation = this.translate.currentLang;
        this.loadDept();
        this.loadUsers();
    }

    get deptC() {
        return this.deptForm.controls;
    }

    get userC() {
        return this.userForm.controls;
    }

    private loadDept() {
        this.ds.getDepartments().subscribe((data: any) => {
            this.departments = data;
        });
    }

    private loadUsers() {
        this.ds.getUsers().subscribe((data: any) => {
            this.users = data;
        });
    }

    submitDepartment() {
        this.department = {
            id: 0,
            nameEn: this.deptForm.value.nameEn,
            nameFr: this.deptForm.value.nameFr,
            acronymEn: this.deptForm.value.acronymEn,
            acronymFr: this.deptForm.value.acronymFr,
            searchUrlEn: this.deptForm.value.urlEn,
            searchUrlFr: this.deptForm.value.urlFr
        }

        this.department.nameEn = this.deptForm.value.nameEn;
        this.department.nameFr = this.deptForm.value.nameFr;
        this.department.acronymEn = this.deptForm.value.acronymEn;
        this.department.acronymFr = this.deptForm.value.acronymFr;
        this.department.searchUrlEn = this.deptForm.value.urlEn;
        this.department.searchUrlFr = this.deptForm.value.urlFr;

        this.isDeptSubmitted = true;

        this.ds.addDepartment(this.department).subscribe({
            next: async () => {
                this.deptForm.reset();
                this.isDeptSuccess = true;
                this.loadDept();
                await new Promise(f => setTimeout(f, 10000));
                this.isDeptSubmitted = false;
            },
            error: (err) => {
                this.isDeptSuccess = false;

                if (err.status === 0) {
                    // Network or CORS error
                    this.translate.get('ADMIN.SERVER_ERROR_NETWORK').subscribe((res: string) => {
                        this.deptErrorMessage = res;
                    });
                } else if (err.status === 400 || err.status === 422) {
                    // BadRequestException (e.g. validation error)
                    this.translate.get('ADMIN.SERVER_ERROR_ENTRY').subscribe((res: string) => {
                        this.deptErrorMessage = res;
                    });
                } else if (err.status === 403) {
                    // Forbidden
                    this.translate.get('ADMIN.SERVER_ERROR_FORBIDDEN').subscribe((res: string) => {
                        this.deptErrorMessage = res;
                    });
                } else {
                    // Generic fallback
                    this.translate.get('ADMIN.SERVER_ERROR_FALLBACK').subscribe((res: string) => {
                        this.deptErrorMessage = res;
                    });
                }
            }
        });


    }

    submitUser() {
        this.user = {
            email: this.userForm.value.email,
            password: this.userForm.value.password,
            firstName: this.userForm.value.firstName,
            lastName: this.userForm.value.lastName,
            admin: this.userForm.value.isAdmin,
            departmentId: this.userForm.value.departmentId
        }

        this.isUserSubmitted = true;

        this.ds.addUser(this.user).subscribe({
            next: async () => {
                this.userForm.reset();
                this.isUserSuccess = true;
                this.loadUsers();
                await new Promise(f => setTimeout(f, 10000));
                this.isUserSubmitted = false;
            },
            error: (err) => {
                this.isUserSuccess = false;

                if (err.status === 0) {
                    // Network or CORS error
                    this.translate.get('ADMIN.SERVER_ERROR_NETWORK').subscribe((res: string) => {
                        this.userErrorMessage = res;
                    });
                } else if (err.status === 400 || err.status === 422) {
                    // BadRequestException (e.g. validation error)
                    this.translate.get('ADMIN.SERVER_ERROR_ENTRY').subscribe((res: string) => {
                        this.userErrorMessage = res;
                    });
                } else if (err.status === 403) {
                    // Forbidden
                    this.translate.get('ADMIN.SERVER_ERROR_FORBIDDEN').subscribe((res: string) => {
                        this.userErrorMessage = res;
                    });
                } else {
                    // Generic fallback
                    this.translate.get('ADMIN.SERVER_ERROR_FALLBACK').subscribe((res: string) => {
                        this.userErrorMessage = res;
                    });
                }
            }
        });


    }


}
