import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DataService } from 'src/app/data.service';
import { Department } from '../admin/admin.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
  departments: Department[];
  department!: Department;
  currentTranslation: string | undefined;
  ds: DataService;
  
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
    this.departments = this.route.snapshot.data['departments'].departments;
  }

  ngOnInit() {
    this.currentTranslation = this.translate.currentLang;
    console.log(this.route.snapshot.data['departments'].departments);
  }
}
