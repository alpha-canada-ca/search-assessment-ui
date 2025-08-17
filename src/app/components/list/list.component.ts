import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {DataService, Language} from 'src/app/services/data.service';
import {StorageService} from 'src/app/services/storage.service';
import {TranslateService} from "@ngx-translate/core";

export interface List {
    id:         number;
    name:       string;
    language: Language;
}

export interface Term {
    id:         number;
    term:       string;
    targetUrls: TargetUrl[];
    position:      number;
}

export interface CreateListRequest {
    name:       string;
    languageId: number;
}

export interface TargetUrl {
    id: number;
    url: string;
}

export interface CreateTermRequest {
    id: number;
    term:       string;
    position:      number;
    targetUrls: TargetUrl[];
}

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    standalone: false
})
export class ListComponent implements OnInit {
    lists: List[] = [];
    selectedListId: number | null = null;

    // Reactive form for creating a list (name + language)
    listForm!: FormGroup;
    // Reactive form for terms
    termsForm!: FormGroup;

    // Loading and error states
    loadingLists = false;
    savingList = false;
    savingTerms = false;
    confirmMessage: string = '';
    createErrorMessage: string | null = null;
    listErrorMessage: string | null = null;

    languages: Language[] = [];
    eng: Language | undefined = {} as Language;
    fra: Language | undefined = {} as Language;


    constructor(
        private fb: FormBuilder,
        private dataService: DataService,
        private storage: StorageService,
        private translate: TranslateService
    ) {
    }

    ngOnInit(): void {
        // Initialize forms once FormBuilder is available
        this.listForm = this.fb.group({
            name: ['', Validators.required],
            languageId: [null, Validators.required]
        });
        this.termsForm = this.fb.group({
            terms: this.fb.array([])
        });

        this.translate.get('USER.DELETE_CONFIRM').subscribe((res: string) => {
            this.confirmMessage = res;
        });
        this.dataService.listLanguages().subscribe((data: Language[]) => {
            this.languages = data;
            this.eng = data.find(lang => lang.code === 'en');
            this.fra = data.find(lang => lang.code === 'fr');
        });



        this.loadLists();
    }

    /** FormArray getter for terms */
    get terms(): FormArray {
        return this.termsForm.get('terms') as FormArray;
    }

    /** Clears all term rows */
    clearTerms(): void {
        while (this.terms.length) {
            this.terms.removeAt(0);
        }
    }

    /** Creates a FormGroup for a single term */
    private createTermGroup(t?: Term) {

        const initialTargets = (t?.targetUrls && t.targetUrls.length > 0)
            ? t.targetUrls
            : [{id: null, url: ''}];

        // build an array of FormControl for targetUrls
        const urls = initialTargets.map(u =>
            this.fb.group({
                id: [u.id],
                url: [u.url, [Validators.required, Validators.pattern('https?://.+')]]
            })
        );


        return this.fb.group({
            id: [t?.id],
            term: [t?.term || '', Validators.required],
            targetUrls: this.fb.array(urls),
            position: [t?.position ?? this.terms.length + 1]
        });
    }

    getTermUrls(i: number): FormArray {
        return (this.terms.at(i).get('targetUrls') as FormArray);
    }

    /** Push a new URL control onto term #i */
    addUrl(i: number) {
        this.getTermUrls(i).push(this.fb.group({
            id: [null],
            url: ['', [Validators.required, Validators.pattern('https?://.+')]]
        }));
    }

    /** Remove URL #j from term #i */
    removeUrl(i: number, j: number): void {
        this.getTermUrls(i).removeAt(j);
    }


    /** Adds an empty term row */
    addTerm(): void {
        this.terms.push(this.createTermGroup());
    }

    /** Removes term at position and reindexes */
    removeTerm(i: number): void {
        this.terms.removeAt(i);
        this.terms.controls.forEach((ctrl, idx) =>
            ctrl.get('position')!.setValue(idx + 1)
        );
    }


    /** Loads existing lists for the user */
    loadLists(): void {
        this.loadingLists = true;
        this.listErrorMessage = null;
        const deptId = this.storage.getDepartmentId();
        if (deptId != null) {
            this.dataService.getListsByMe()
                .pipe(finalize(() => (this.loadingLists = false)))
                .subscribe(
                    l => (this.lists = l),
                    () => (this.listErrorMessage = 'Failed to load lists')
                );
        }
    }

    /** Handler when a list is selected from dropdown */
    onListSelect(value: string): void {
        const id = parseInt(value, 10);
        this.selectedListId = isNaN(id) ? null : id;
        this.clearTerms();
        if (this.selectedListId != null) {
            this.dataService.listTerms(this.selectedListId)
                .subscribe(
                    terms => {
                        terms.sort((a, b) => a.position - b.position)
                            .forEach(t => this.terms.push(this.createTermGroup(t)));
                    },
                    () => (this.listErrorMessage = 'Failed to load terms')
                );
        }
    }

    /** Creates a new list based on form input */
    createList(): void {
        if (this.listForm.invalid) return;
        this.savingList = true;
        this.createErrorMessage = null;
        const req: CreateListRequest = {
            name: this.listForm.value.name,
            languageId: this.listForm.value.languageId
        };
        this.dataService.createList(req)
            .pipe(finalize(() => (this.savingList = false)))
            .subscribe({
                next: (newList) => {
                    this.lists.push(newList);
                    this.listForm.reset();
                    this.onListSelect(newList.id.toString());
                },
                error: (err) => {
                    if (err.status === 0) {
                        // Network or CORS error
                        this.translate.get('ADMIN.SERVER_ERROR_NETWORK').subscribe((res: string) => {
                            this.createErrorMessage = res;
                        });
                    } else if (err.status === 400 || err.status === 422) {
                        // BadRequestException (e.g. validation error)
                        this.translate.get('ADMIN.SERVER_ERROR_ENTRY').subscribe((res: string) => {
                            this.createErrorMessage = res;
                        });
                    } else if (err.status === 403) {
                        // Forbidden
                        this.translate.get('ADMIN.SERVER_ERROR_FORBIDDEN').subscribe((res: string) => {
                            this.createErrorMessage = res;
                        });
                    } else if (err.status === 409) {
                        // Forbidden
                        this.translate.get('USER.LIST_ERROR_CONFLICT').subscribe((res: string) => {
                            this.createErrorMessage = res;
                        });
                    } else {
                        // Generic fallback
                        this.translate.get('USER.LIST_ERROR_FALLBACK').subscribe((res: string) => {
                            this.createErrorMessage = res;
                        });
                    }
                }
            });
    }

    /** Deletes the selected list */
    deleteList(): void {
        if (this.selectedListId == null) return;
        if (!confirm(this.confirmMessage)) return;
        this.dataService.deleteList(this.selectedListId)
            .subscribe({
                next: (newList) => {
                    this.selectedListId = null;
                    this.clearTerms();
                    this.loadLists();
                },
                error: (err) => {
                    if (err.status === 0) {
                        // Network or CORS error
                        this.translate.get('ADMIN.SERVER_ERROR_NETWORK').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    } else if (err.status === 400 || err.status === 422) {
                        // BadRequestException (e.g. validation error)
                        this.translate.get('ADMIN.SERVER_ERROR_ENTRY').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    } else if (err.status === 403) {
                        // Forbidden
                        this.translate.get('ADMIN.SERVER_ERROR_FORBIDDEN').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    } else {
                        // Generic fallback
                        this.translate.get('USER.LIST_ERROR_FALLBACK').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    }
                }
            });

    }

    /** Saves all term entries in bulk */
    saveTerms(): void {
        if (!this.selectedListId || this.termsForm.invalid) return;
        this.savingTerms = true;

        const payload = this.terms.value.map((t: any) => ({
            id: t.id,        // undefined ⇒ create; number ⇒ update
            term: t.term,
            position: t.position,
            targetUrls: t.targetUrls
        }));

        this.dataService
            .upsertTermsBulk(this.selectedListId, payload)
            .pipe(finalize(() => (this.savingTerms = false)))
            .subscribe({
                next: (newList) => {
                    this.onListSelect(this.selectedListId!.toString())
                },
                error: (err) => {
                    if (err.status === 0) {
                        // Network or CORS error
                        this.translate.get('ADMIN.SERVER_ERROR_NETWORK').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    } else if (err.status === 400 || err.status === 422) {
                        // BadRequestException (e.g. validation error)
                        this.translate.get('ADMIN.SERVER_ERROR_ENTRY').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    } else if (err.status === 403) {
                        // Forbidden
                        this.translate.get('ADMIN.SERVER_ERROR_FORBIDDEN').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    } else if (err.status === 409) {
                        // Forbidden
                        this.translate.get('USER.LIST_ERROR_CONFLICT_URL').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    } else {
                        // Generic fallback
                        this.translate.get('USER.LIST_ERROR_FALLBACK').subscribe((res: string) => {
                            this.listErrorMessage = res;
                        });
                    }
                }
            })
    }

    getLanguageLabel(id: number): string {
        const lang = this.languages.find(l => l.id == id);
        return lang ? lang.name : '';
    }

}
