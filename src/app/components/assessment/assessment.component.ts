import {Component, OnInit} from '@angular/core';
import {DataService} from 'src/app/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from "@angular/platform-browser";
import {Department} from 'src/app/components/admin/admin.component';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {DatePipe} from '@angular/common';

export interface Assessment {
    contextualSuccessRate: '0%';
    globalSuccessRate: '0%';
    googleSuccessRate: '0%';
    contextualScore: number;
    globalScore: number;
    googleScore: number;
    date: string;
    currentSearchUrl: string;
    contextualUrl: string;
    globalUrl: string;
    googleUrl: string;
    type: string;
    department: Department;
    lang: string;
    hasContextual: boolean;
    contextualTerms: Evaluation[];
    globalTerms: Evaluation[];
    googleTerms: Evaluation[];
}

export interface AnalysisStatus {
    numAnalysis: number;
    queued: number;
    toAnalyze: AssessmentQueue;
}

export interface AssessmentQueue {
    google: string[];
    contextual: string[];
    global: string[];
}


export interface Match {
    matches: object;
    matchingScore: number;
}

export interface Metadata {
    text: string;
    highlightedText: string;
    matches: Match;
}

export interface Fields {
    title: Metadata;
    description: Metadata;
    keywords: Metadata;
    lastUpdate: string;
}

export interface Evaluation {
    date: string;
    term: string;
    isPass: boolean;
    passingUrl: string;
    passingUrlPosition: number;
    passingUrlMetadata: Fields;
}


@Component({
    selector: 'app-score',
    templateUrl: './assessment.component.html',
    styleUrls: ['./assessment.component.css'],
    providers: [DatePipe]
})

export class AssessmentComponent implements OnInit {

    date: string = "";
    assessment: Assessment = {
        contextualSuccessRate: '0%',
        globalSuccessRate: '0%',
        googleSuccessRate: '0%',
        contextualScore: 0,
        globalScore: 0,
        googleScore: 0,
        date: '',
        currentSearchUrl: '',
        contextualUrl: '',
        globalUrl: '',
        googleUrl: '',
        type: '',
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
        contextualTerms: [],
        globalTerms: [],
        googleTerms: []
    }
    analysisStatus: AnalysisStatus = {
        numAnalysis: 0,
        queued: 0,
        toAnalyze: {
            google: [],
            contextual: [],
            global: []
        }
    }
    source: string = "";
    lang: string = "";
    format: string = "json";
    blob: Blob | undefined;
    availableDates: string[] = [];
    currentTranslation: string = "";
    statuses: any[] = [];
    // to be deleted for the new UI
    evaluatedTerms: Evaluation[] = [];
    score: number = 0;
    successRate: string = '0%';


    constructor(private titleService: Title, private dataService: DataService, private activatedRoute: ActivatedRoute, private translate: TranslateService, private router: Router) {
        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            translate.get('SCORE.TITLE').subscribe((res: string) => {
                titleService.setTitle(res);
            });
        });
    }

    ngOnInit() {
        this.translate.get('SCORE.TITLE').subscribe((res: string) => {
            this.titleService.setTitle(res);
        });
        this.currentTranslation = this.translate.currentLang;
        this.activatedRoute.queryParams
            .subscribe(params => {
                this.source = params['source'];
                this.lang = params['lang'];
                this.date = params['date'];
                this.format = params['format'];
            });

        this.dataService.getAssessment(this.source, this.lang, this.date)
            .subscribe((data: any) => {
                    this.assessment = {
                        contextualSuccessRate: data.contextualSuccessRate,
                        globalSuccessRate: data.globalSuccessRate,
                        googleSuccessRate: data.googleSuccessRate,
                        contextualScore: data.contextualSuccessRate ? Number(data.contextualSuccessRate.substring(0, data.contextualSuccessRate.length - 2)) : 0,
                        globalScore: data.globalSuccessRate ? Number(data.globalSuccessRate.substring(0, data.globalSuccessRate.length - 2)) : 0,
                        googleScore: data.googleSuccessRate ? Number(data.googleSuccessRate.substring(0, data.googleSuccessRate.length - 2)) : 0,
                        currentSearchUrl: data.currentSearchUrl,
                        contextualUrl: data.contextualUrl,
                        globalUrl: data.globalUrl,
                        googleUrl: data.googleUrl,
                        date: data.date,
                        type: data.type,
                        department: data.department,
                        lang: data.lang,
                        hasContextual: data.hasContextual,
                        contextualTerms: data.evaluatedTerms.contextual,
                        globalTerms: data.evaluatedTerms.global,
                        googleTerms: data.evaluatedTerms.google
                    }
                    if (this.assessment.contextualTerms && this.assessment.contextualTerms.length > 0) {
                        this.evaluatedTerms = this.assessment.contextualTerms;
                    } else if (this.assessment.globalTerms && this.assessment.globalTerms.length > 0) {
                        this.evaluatedTerms = this.assessment.globalTerms;
                    } else if (this.assessment.googleTerms && this.assessment.googleTerms.length > 0) {
                        this.evaluatedTerms = this.assessment.googleTerms;
                    }

                    let count = 0;
                    for (let i = 0; i < this.evaluatedTerms.length; i++) {
                        if (this.assessment.hasContextual && this.assessment.googleTerms) {
                            if (this.isPass(this.assessment.globalTerms[i], this.assessment.googleTerms[i], this.assessment.contextualTerms[i])) {
                                count++;
                                this.evaluatedTerms[i].isPass = true;
                            } else {
                                this.evaluatedTerms[i].isPass = false;
                            }
                        } else if (this.assessment.hasContextual) {
                            if (this.isPass(this.assessment.globalTerms[i], this.assessment.contextualTerms[i])) {
                                count++;
                                this.evaluatedTerms[i].isPass = true;
                            } else {
                                this.evaluatedTerms[i].isPass = false;
                            }
                        } else if (this.assessment.googleTerms) {
                            if (this.isPass(this.assessment.globalTerms[i], this.assessment.googleTerms[i])) {
                                count++;
                                this.evaluatedTerms[i].isPass = true;
                            } else {
                                this.evaluatedTerms[i].isPass = false;
                            }
                        } else {
                            if (this.assessment.globalTerms[i].isPass) {
                                count++;
                                this.evaluatedTerms[i].isPass = true;
                            }
                        }
                    }
                    this.score = count;
                    if (this.evaluatedTerms.length > 0) {
                        this.successRate = Math.round(((this.score / this.evaluatedTerms.length) * 100)) + '%';
                    }
                }
            );

        this.dataService.getAvailableDates(this.source, this.lang).subscribe((data: any) => {
            this.availableDates = data.dates;
        });

        this.dataService.analyze(this.source, this.lang)
            .subscribe((data: any) => this.analysisStatus = {
                numAnalysis: data.numAnalysis,
                queued: data.queued,
                toAnalyze: data.toAnalyze
            });

        this.statuses = new Array(this.evaluatedTerms.length).fill(false);

    }

    downloadCsv() {
        this.dataService.downloadAssessment(this.source, this.lang, this.date, "csv")
            .subscribe((data: any) => {
                this.blob = new Blob([data], {type: 'text/csv'});

                var downloadURL = window.URL.createObjectURL(data);
                var link = document.createElement('a');
                link.href = downloadURL;
                link.download = this.assessment.department.acronymEn + '-' + this.assessment.date + '.csv';
                link.click();
            });

    }

    onTypeOptionsSelected(value: string) {
        const queryParams = {
            "source": this.source,
            "lang": this.lang,
            "date": this.date
        };
        this.router.navigate([this.currentTranslation + '/assessment'], {
            queryParams
        }).then(() => {
            window.location.reload();
        })
    }

    onLangOptionsSelected(value: string) {
        const queryParams = {
            "source": this.source,
            "lang": value
        };
        this.router.navigate([this.currentTranslation + '/assessment'], {
            queryParams
        }).then(() => {
            window.location.reload();
        })
    }

    onDateOptionsSelected(value: string) {
        const queryParams = {
            "source": this.source,
            "lang": this.lang,
            "date": value
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

    isPass(global: Evaluation, google: Evaluation, contextual?: Evaluation) {
        if (contextual) {
            return contextual.isPass && global.isPass && google.isPass;
        }
        return global.isPass && google.isPass;
    }

    unmatchedMetaTerms(matches: Match) {
        const j = JSON.parse(JSON.stringify(matches.matches));
        var matchArray: string[] = [];
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
        var matchArray: string[] = [];

        Object.keys(j).forEach(key => {
            matchArray.push(key);
        });

        return matchArray;
    }


}
