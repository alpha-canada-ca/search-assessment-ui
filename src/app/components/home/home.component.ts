import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {DataService, Language} from 'src/app/services/data.service';
import { Department } from '../admin/admin.component';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent {
  
  departments: Department[] = [];
  department!: Department;
  currentTranslation: string | undefined;
  ds: DataService;
  langEnId: number | undefined;
  langFrId: number | undefined;
  
  constructor(titleService: Title, private dataService: DataService, private translate: TranslateService, private route: ActivatedRoute) { 
    translate.get('SCORE.TITLE').subscribe((res: string) => {
      titleService.setTitle(res);
    });
    this.ds = dataService;

    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      translate.get('SCORE.TITLE').subscribe((res: string) => {
        titleService.setTitle(res);
      });
    });

  }

  ngOnInit() {
    this.currentTranslation = this.translate.currentLang;
    this.loadDept();
    this.setLangIds();
  }

  private loadDept() {
    this.ds.listDepartments().subscribe((data: any) => {
      this.departments = data;
    });
  }

  private setLangIds(): void {
    this.ds.listLanguages().subscribe((data: Language[]) => {
      this.langEnId = data.find(lang => lang.code.toLowerCase() === 'en')?.id;
      this.langFrId = data.find(lang => lang.code.toLowerCase() === 'fr')?.id;
    });
  }

}
