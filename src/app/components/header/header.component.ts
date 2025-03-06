import { AfterContentInit, Component, OnInit, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { StorageService } from 'src/app/storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterContentInit {

  lang: string = 'en';
  route: string = "";
  isLoggedIn: boolean;
  dateModified: string = "2024-11-13";
  //ts: string = '';
  titleDisplay: any;
  langDisplay: any;
  homeButton: any;
  searchAssessmentButton: any;
  urlAssessmentButton: any;
  adminButton: any;


  constructor(private titleService: Title, private translate: TranslateService, location: Location, private router: Router, private storageService: StorageService, private renderer2: Renderer2) {
    this.isLoggedIn = this.storageService.isLoggedIn();
    this.router.events.subscribe((val) => {
      if (location.path() != '') {
        this.route = location.path();
        this.isLoggedIn = this.storageService.isLoggedIn();
        //this.ts = titleService.getTitle();
      }
      const parts = this.route.split('/');
      if (translate.getLangs().includes(parts[1])) {
        this.route = parts.slice(2).join('/');
      } else {
        this.route = "";
      }
    });

  }

  async ngAfterContentInit() {
    await new Promise(f => setTimeout(f, 1000));  
    this.loadScripts();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe(async (event: LangChangeEvent) => {
      this.lang = event.lang;
      this.translate.get('GENERAL.TITLE').subscribe((res: string) => {
        this.titleDisplay = res;
      });
      this.translate.get('GENERAL.LANG_SWITCH').subscribe((res: string) => {
        this.langDisplay = res;
      });
      this.translate.get('GENERAL.HOME').subscribe((res: string) => {
        this.homeButton = res;
      });
      this.translate.get('SCORE.TITLE').subscribe((res: string) => {
        this.searchAssessmentButton = res;
      });
      this.translate.get('URL.TITLE').subscribe((res: string) => {
        this.urlAssessmentButton = res;
      });
      this.translate.get('GENERAL.ADMIN').subscribe((res: string) => {
        this.adminButton = res;
      });

    });

  }


  loadScripts() {
    const wetScript = 'https://www.canada.ca/etc/designs/canada/cdts/gcweb/rn/cdts/compiled/wet-' + this.lang + '.js';

    const isLoggedIn = this.storageService.isLoggedIn();
    const invLang = this.lang == "fr" ? "en" : "fr";
    const signButtonUrl = "/" + this.lang + "/login" + (isLoggedIn ? "?isLogout=true" : "");
    var data: any;

    data = {
      "mode": "app",
      "cdnEnv": "prod",
      "top": {
        "breadcrumbs": [{ "title": this.homeButton, "href": this.lang }],
        "appName": [{ "text": this.titleDisplay, "href": "/" + this.lang + "/" }],
        "lngLinks": [{ "lang": invLang, "href": "/" + invLang + "/" + this.route, "text": this.langDisplay }],
        "menuLinks": [{
          "href": "/" + this.lang + "/",
          "text": this.searchAssessmentButton
        },
        {
          "href": "/" + this.lang + "/urlAssessment",
          "text": this.urlAssessmentButton
        },
        {
          "href": "/" + this.lang + "/admin",
          "text": this.adminButton
        }]
      },
      "preFooter": {
        "showFeedback": false,
        "dateModified": this.dateModified,
      },
      "footer": {
        "showFooter": true
      }
    };

    if (!this.route.startsWith("login")) {
      if (isLoggedIn) {
        data["top"]["signOut"] = [{ "href": signButtonUrl }];
      } else {
        data["top"]["signIn"] = [{ "href": signButtonUrl }];
      }
    }


    const node = this.renderer2.createElement('script');
    node.src = wetScript;
    this.renderer2.setAttribute(node, 'data-cdts-setup', JSON.stringify(data));
    this.renderer2.appendChild(document.head, node);

  }

}
