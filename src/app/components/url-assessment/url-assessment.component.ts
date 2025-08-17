import {Component, OnInit} from '@angular/core';
import {DataService, Language} from 'src/app/services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from "@angular/platform-browser";
import {Department} from 'src/app/components/admin/admin.component';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Assessment, MetadataHighlight, TermAssessment} from "../assessment/assessment.component";
import {finalize, switchMap, tap} from "rxjs/operators";
import {of} from "rxjs";

const urlReg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

export interface UrlAssessmentResponse {
    url: string;
    internalPasses: number;
    internalSpecificPasses: number;
    googlePasses: number;
    internalSpecificScore: string;
    internalScore: string;
    googleScore: string;
    internalSpecificTerms: TermAssessment[];
    internalTerms: TermAssessment[];
    googleTerms: TermAssessment[];
    highlightedMetadata: MetadataHighlight[];
}

@Component({
    selector: 'app-score',
    templateUrl: './url-assessment.component.html',
    styleUrls: ['./url-assessment.component.css'],
    standalone: false
})

export class UrlAssessmentComponent implements OnInit {

    departments: Department[] = [];
    languages: Language[] = [];

    url: string = '';
    urlAssessment: UrlAssessmentResponse = {
        url: '',
        internalPasses: 0,
        internalSpecificPasses: 0,
        googlePasses: 0,
        internalSpecificScore: '0%',
        internalScore: '0%',
        googleScore: '0%',
        internalSpecificTerms: [],
        internalTerms: [],
        googleTerms: [],
        highlightedMetadata: []
    }

    deptId: number = 0;
    langId: number = 0;
    currentTranslation: string = "";
    lang: Language | undefined;
    dept: Department | undefined;
    eng: Language | undefined = {} as Language;
    fra: Language | undefined = {} as Language;

    form = new UntypedFormGroup({
        deptId: new UntypedFormControl('', Validators.required),
        langId: new UntypedFormControl('', Validators.required),
        url: new UntypedFormControl('', [Validators.required, Validators.pattern(urlReg)])
    });
    isSubmitted: boolean = false;


    constructor(private titleService: Title, private dataService: DataService, private activatedRoute: ActivatedRoute, private router: Router, private translate: TranslateService) {
        translate.onLangChange.subscribe(() => {
            translate.get('URL.TITLE').subscribe((res: string) => {
                titleService.setTitle(res);
            });
        });
    }

    ngOnInit() {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.currentTranslation = event.lang;
        });
        this.translate.get('URL.TITLE').subscribe((res: string) => {
            this.titleService.setTitle(res);
        });
        this.currentTranslation = this.translate.currentLang;
        this.activatedRoute.queryParams
            .pipe(
                tap(params => {
                    this.deptId = params['deptId'];
                    this.langId = params['langId'];
                    this.url = params['url'];
                }),
                switchMap(() => this.loadLanguages$()),
                tap<Language[]>(langs => {
                    this.languages = langs;
                    this.lang = langs.find(l => l.id == this.langId);
                    this.eng = langs.find(l => l.code === 'en');
                    this.fra = langs.find(l => l.code === 'fr');
                }),
                switchMap(() => this.loadDepartments$()),
                tap<Department[]>(depts => {
                    this.departments = depts;
                    this.dept = depts.find(dept => dept.id == this.deptId);
                })
            )
            .subscribe();
        if (this.deptId && this.url && this.langId) {
            this.dataService.getUrlAssessment(this.url, this.deptId, this.langId)
                .subscribe((data: any) => this.urlAssessment = data);
        }
    }

    get c() {
        return this.form.controls;
    }

    submit() {
        this.isSubmitted = true;
        const queryParams = this.form.value;
        this.router.navigate([this.currentTranslation + '/urlAssessment'], {
            queryParams
        }).then(() => {
            window.location.reload();
        })
    }

    private loadLanguages$() {
        return this.dataService.listLanguages();
    }

    private loadDepartments$() {
        return this.dataService.listDepartments();
    }


}
