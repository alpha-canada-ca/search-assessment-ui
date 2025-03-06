import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/data.service';
import { StorageService } from 'src/app/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isSuccess: boolean = false;
  isSubmitted: boolean = false;
  currentTranslation: string | undefined;
  isLogout: boolean = false;
  
  form = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
    password: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
  });

  constructor(private activatedRoute: ActivatedRoute, private titleService: Title, private dataService: DataService, private router: Router, private translate: TranslateService, private storageService: StorageService) { 
  translate.onLangChange.subscribe((event: LangChangeEvent) => {
      translate.get('LOGIN.TITLE').subscribe((res: string) => {
        titleService.setTitle(res);
      });
    });
    translate.get('LOGIN.TITLE').subscribe((res: string) => {
      titleService.setTitle(res);
    });
  }

  ngOnInit() {
    this.activatedRoute.queryParams
      .subscribe(params => {
        this.isLogout = params['isLogout'];
      });
    this.currentTranslation = this.translate.currentLang;
    this.translate.get('LOGIN.TITLE').subscribe((res: string) => {
      this.titleService.setTitle(res);
    });

    if (this.isLogout) {
      this.storageService.logOut();
    }
  }

  get c() {
    return this.form.controls;
  }

  submit() {    
    this.dataService.validateUser(this.form.value.username, this.form.value.password).subscribe(async (data: any) => {
      this.isSubmitted = true; 
      if (data.status == 'success' && data.isValid == true) {
        this.isSuccess = true;
        this.storageService.logIn(); 
        await new Promise(f => setTimeout(f, 2000));  
        this.router.navigate([this.currentTranslation + '/admin']);  
      } else {
        this.isSuccess = false;
      }
    });
    }


}
