import {Component, OnInit} from '@angular/core';
import {DataService, Language} from 'src/app/services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from "@angular/platform-browser";
import {Department} from 'src/app/components/admin/admin.component';
import {TranslateService} from '@ngx-translate/core';
import {finalize, switchMap, tap} from "rxjs/operators";
import {UserProfile} from "../login/login.component";
import {of} from "rxjs";

export interface Assessment {
    id: number;
    termList: string;
    name: string;
    date: string;
}

export interface AssessmentResponse {
    id: number;
    list: TermList;
    name: string;
    date: string;
    hasSpecificSearch: boolean;
    internalSpecificScore: string;
    internalScore: string;
    internalPasses: number;
    internalSpecificUrl: string;
    internalSpecificPasses: number;
    googlePasses: number;
    internalUrl: string;
    googleScore: string;
    googleUrl: string;
    internalSpecificTerms: TermAssessment[];
    internalTerms: TermAssessment[];
    googleTerms: TermAssessment[];
    highlightedMetadata: MetadataHighlight[];
}

export interface TermList {
    id: number;
    name: string;
    language: Language;
    user: UserProfile;
}

export interface TermAssessment {
    id: number;
    term: string;
    pass: boolean;
    position: number;
    searchType: string;
    targetUrl: string;
}

export interface MetadataHighlight {
    title: Highlighting;
    description: Highlighting;
    h1: Highlighting;
    lastUpdate: Highlighting;
}

export interface Highlighting {
    text: string;
    matches: Match;
    highlightedText: string;
}

export interface AnalysisStatus {
    message: number;
    queued: number;
}

export interface Match {
    matches: object;
    matchingScore: number;
}

@Component({
    selector: 'app-assessment',
    templateUrl: './assessment.component.html',
    styleUrls: ['./assessment.component.css'],
    standalone: false
})
export class AssessmentComponent implements OnInit {
    id: number | undefined;
    deptId: number = 0;
    langId: number = 0;
    format: string = "json";
    languages: Language[] = [];
    lang: Language | undefined = {} as Language;
    eng: Language | undefined = {} as Language;
    fra: Language | undefined = {} as Language;
    department: Department | undefined = {} as Department;

    assessment: AssessmentResponse = {
        id: 0,
        list: {
            id: 0,
            name: '',
            language: {} as Language,
            user: {} as UserProfile
        },
        name: '',
        date: '',
        hasSpecificSearch: false,
        internalPasses: 0,
        internalSpecificPasses: 0,
        googlePasses: 0,
        internalSpecificUrl: '',
        internalSpecificScore: '0%',
        internalScore: '0%',
        internalUrl: '',
        googleScore: '0%',
        googleUrl: '',
        internalSpecificTerms: [],
        internalTerms: [],
        googleTerms: [],
        highlightedMetadata: []
    }

    blob: Blob | undefined;
    currentTranslation: string = "";
    statuses: any[] = [];
    evaluatedTerms: TermAssessment[] = [];
    score: number = 0;
    successRate: string = '0%';
    departmentAssessments: Assessment[] = [];
    loadingLists: boolean = false;

    constructor(private titleService: Title, private dataService: DataService, private activatedRoute: ActivatedRoute, private translate: TranslateService, private router: Router) {
        translate.onLangChange.subscribe(() => {
            translate.get('SCORE.TITLE').subscribe((res: string) => {
                titleService.setTitle(res);
            });
        });
        dataService.listLanguages().subscribe((data: Language[]) => {
            this.languages = data;
            this.lang = data.find(lang => lang.id == this.langId);
            this.eng = data.find(lang => lang.code === 'en');
            this.fra = data.find(lang => lang.code === 'fr');
        });
    }

    ngOnInit() {
        this.translate.get('SCORE.TITLE').subscribe((res: string) => {
            this.titleService.setTitle(res);
        });
        this.currentTranslation = this.translate.currentLang;
        this.activatedRoute.queryParams
            .pipe(
                tap(params => {
                    this.deptId = params['deptId'];
                    this.id = params['id'];
                    this.langId = params['langId'];
                    this.format = params['format'];
                }),
                switchMap(() => this.loadAssessmentsByDepartment$()), // <-- wait for lists
                tap<Assessment[]>(lists => {
                    this.departmentAssessments = lists;

                    if (lists.length) {
                        if (!this.id) {
                            this.id = lists[0].id;
                        }
                        this.loadAssessment()
                    } else { // Since we couldn't get the department entity from an assessment
                        this.setDepartment();
                    }
                })
            )
            .subscribe();

    }

    downloadCsv() {
        this.dataService.downloadAssessmentAsCsv(this.id)
            .subscribe((data: any) => {
                this.blob = new Blob([data], {type: 'text/csv'});

                const downloadURL = URL.createObjectURL(data);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = this.assessment.name + '-' + this.assessment.date + '.csv';
                link.click();
            });
    }

    onLangOptionsSelected(value: string) {
        const queryParams = {
            "deptId": this.deptId,
            "langId": value
        };
        this.router.navigate([this.currentTranslation + '/assessment'], {
            queryParams
        }).then(() => {
            window.location.reload();
        })
    }

    onListOptionsSelected(value: string) {
        const queryParams = {
            "id": value
        };
        this.router.navigate([this.currentTranslation + '/assessment'], {
            queryParams
        }).then(() => {
            window.location.reload();
        })
    }


    clickEvent(i: number) {
        this.statuses[i] = !this.statuses[i];
    }

    isPass(internal: TermAssessment, google: TermAssessment, internalSpecific?: TermAssessment) {
        if (internalSpecific) {
            return internalSpecific.pass && internal.pass && google.pass;
        }
        return internal.pass && google.pass;
    }

    unmatchedMetaTerms(matches: Match) {
        const j = JSON.parse(JSON.stringify(matches.matches));
        let matchArray: string[] = [];
        if (matches.matches && matches.matchingScore < 2) {
            Object.keys(j).forEach(key => {
                if (j[key] == 0) {
                    matchArray.push(key);
                }
            });

        }
        return matchArray;
    }

    allMetaTerms(matches: Match) {
        const j = JSON.parse(JSON.stringify(matches.matches));
        let matchArray: string[] = [];

        Object.keys(j).forEach(key => {
            matchArray.push(key);
        });

        return matchArray;
    }

    private loadAssessmentsByDepartment$() {
        this.loadingLists = true;

        if (!this.deptId) {
            this.loadingLists = false;
            return of([]);
        }

        return this.dataService.getAssessmentsByDepartment(this.deptId, this.langId)
            .pipe(finalize(() => (this.loadingLists = false)));
    }

    loadAssessment(): void {
        this.dataService.getAssessment(this.id)
            .subscribe((data: any) => {
                    this.assessment = data;
                    this.department = this.assessment.list.user.department;
                    if (this.assessment.internalSpecificTerms) {
                        this.evaluatedTerms = this.assessment.internalSpecificTerms;
                    } else if (this.assessment.internalTerms) {
                        this.evaluatedTerms = this.assessment.internalTerms;
                    } else if (this.assessment.googleTerms) {
                        this.evaluatedTerms = this.assessment.googleTerms;
                    }

                    let count = 0;
                    for (let i = 0; i < this.evaluatedTerms.length; i++) {
                        if (this.assessment.hasSpecificSearch && this.assessment.googleTerms) {
                            if (this.isPass(this.assessment.internalTerms[i], this.assessment.googleTerms[i], this.assessment.internalSpecificTerms[i])) {
                                count++;
                                this.evaluatedTerms[i].pass = true;
                            } else {
                                this.evaluatedTerms[i].pass = false;
                            }
                        } else if (this.assessment.hasSpecificSearch) {
                            if (this.isPass(this.assessment.internalTerms[i], this.assessment.internalSpecificTerms[i])) {
                                count++;
                                this.evaluatedTerms[i].pass = true;
                            } else {
                                this.evaluatedTerms[i].pass = false;
                            }
                        } else if (this.assessment.googleTerms) {
                            if (this.isPass(this.assessment.internalTerms[i], this.assessment.googleTerms[i])) {
                                count++;
                                this.evaluatedTerms[i].pass = true;
                            } else {
                                this.evaluatedTerms[i].pass = false;
                            }
                        } else {
                            if (this.assessment.internalTerms[i].pass) {
                                count++;
                                this.evaluatedTerms[i].pass = true;
                            }
                        }
                    }
                    this.score = count;
                    if (this.evaluatedTerms.length > 0) {
                        this.successRate = Math.round(((this.score / this.evaluatedTerms.length) * 100)) + '%';
                    }
                }
            );
    }

    setDepartment() {
        this.dataService.listDepartments()
            .subscribe((data: Department[]) => {
                this.department = data.find(dept => dept.id == this.deptId);
            });
    }

}
