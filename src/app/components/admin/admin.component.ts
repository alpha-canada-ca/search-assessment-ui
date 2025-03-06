import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators  } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/data.service';

const urlReg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

export interface Department {
  nameEn: string;
  nameFr: string;
  acronymEn: string;
  acronymFr: string;
  urlEn: string;
  urlFr: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  departments: Department[];
  department!: Department;
  isSuccess: boolean = false;
  isSubmitted: boolean = false;
  currentTranslation: string | undefined;
  
  form = new UntypedFormGroup({
    nameEn: new UntypedFormControl('', [Validators.required, Validators.minLength(10)]),
    nameFr: new UntypedFormControl('', [Validators.required, Validators.minLength(10)]),
    acronymEn: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
    acronymFr: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
    urlEn: new UntypedFormControl('', Validators.pattern(urlReg)),
    urlFr: new UntypedFormControl('', Validators.pattern(urlReg))
  });

  ds: DataService;

  constructor(titleService: Title, dataService: DataService, private translate: TranslateService, private route: ActivatedRoute) { 
    this.ds = dataService;
    translate.get('ADMIN.TITLE').subscribe((res: string) => {
      titleService.setTitle(res);
    });

    this.departments = this.route.snapshot.data['departments'].departments;

    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      translate.get('ADMIN.TITLE').subscribe((res: string) => {
        titleService.setTitle(res);
      });
    });
  }

  ngOnInit() {
    this.currentTranslation = this.translate.currentLang;
  }

  get c() {
    return this.form.controls;
  }

  submit() {
    this.department = {
      nameEn: this.form.value.nameEn,
      nameFr: this.form.value.nameFr,
      acronymEn: this.form.value.acronymEn,
      acronymFr: this.form.value.acronymFr,
      urlEn: this.form.value.urlEn,
      urlFr: this.form.value.urlFr
    }

    this.department.nameEn = this.form.value.nameEn;
    this.department.nameFr = this.form.value.nameFr;
    this.department.acronymEn = this.form.value.acronymEn;
    this.department.acronymFr = this.form.value.acronymFr;
    this.department.urlEn = this.form.value.urlEn;
    this.department.urlFr = this.form.value.urlFr;

    this.ds.addDepartment(this.department).subscribe(async (data: any) => {
      this.isSubmitted = true; 
      if (data.status == 'success') {
        this.form.reset();
        this.isSuccess = true;
        this.ds.getDepartments().subscribe((data: any) => { 
          this.departments = data.departments;
        });      
        await new Promise(f => setTimeout(f, 10000));
        this.isSubmitted = false; 
      }
    });


  }

}
