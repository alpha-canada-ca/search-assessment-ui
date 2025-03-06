import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from "@angular/platform-browser";
import { Department } from 'src/app/components/admin/admin.component';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { Evaluation } from '../assessment/assessment.component';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

const urlReg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

export interface UrlAssessment {
  isAssessmentRetrieved: boolean;
  globalSuccessRate: '0%';
  globalScore: number;
  googleSuccessRate: '0%';
  googleScore: number;
  contextualSuccessRate: '0%';
  contextualScore: number;
  date: string;
  department: Department;
  lang: string;
  hasContextual: boolean;
  globalTerms: Evaluation[];
  googleTerms: Evaluation[];
  contextualTerms: Evaluation[];
}

@Component({
  selector: 'app-score',
  templateUrl: './url-assessment.component.html',
  styleUrls: ['./url-assessment.component.css'],
  providers: [DatePipe]
})

export class UrlAssessmentComponent implements OnInit {

  departments: Department[] = [];

  url: string = "";
  urlAssessment: UrlAssessment = {
    isAssessmentRetrieved: false,
    globalSuccessRate: '0%',
    googleSuccessRate: '0%',
    contextualSuccessRate: '0%',
    globalScore: 0,
    googleScore: 0,
    contextualScore: 0,
    date: '',
    department: {
      nameEn: '',
      nameFr: '',
      acronymEn: '',
      acronymFr: '',
      urlEn: '',
      urlFr: '',
    },
    lang: '',
    hasContextual: false,
    globalTerms: [],
    googleTerms: [],
    contextualTerms: []
  }

  source: string = "";
  lang: string = "";
  currentTranslation: string = "";

  form = new UntypedFormGroup({
    source: new UntypedFormControl('', Validators.required),
    lang: new UntypedFormControl('', Validators.required),
    url: new UntypedFormControl('', [Validators.required, Validators.pattern(urlReg)])
  });
  isSubmitted: boolean = false;


  constructor(private titleService: Title, private dataService: DataService, private activatedRoute: ActivatedRoute, private router: Router, private translate: TranslateService) {
    dataService.getDepartments().subscribe((data: any) => {
      this.departments = data.departments;
    });
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
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
      .subscribe(params => {
        this.source = params['source'];
        this.lang = params['lang'];
        this.url = params['url'];
      });

    if (this.source && this.url) {
      this.dataService.getUrlAssessment(this.source, this.lang, this.url)
        .subscribe((data: any) => this.urlAssessment = {
          isAssessmentRetrieved: true,
          globalSuccessRate: data.globalSuccessRate,
          googleSuccessRate: data.googleSuccessRate,
          contextualSuccessRate: data.contextualSuccessRate,
          globalScore: Number(data.globalSuccessRate.substring(0, data.globalSuccessRate.length - 2)),
          googleScore: Number(data.googleSuccessRate.substring(0, data.googleSuccessRate.length - 2)),
          contextualScore: data.contextualSuccessRate != null ? Number(data.contextualSuccessRate.substring(0, data.contextualSuccessRate - 2)) : 0,
          date: data.date,
          department: data.department,
          lang: data.lang,
          hasContextual: data.hasContextual,
          globalTerms: data.globalTerms,
          googleTerms: data.googleTerms,
          contextualTerms: data.contextualTerms
        });
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


}
