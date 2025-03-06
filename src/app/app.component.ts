import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  route: string = "";
  script: any;
  defPrefooter: any;
  lang: any;

  constructor(location: Location, private router: Router, translate: TranslateService) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');

    this.router.events.subscribe(() => {
      if (location.path() != '') {
        this.route = location.path();
        const parts = this.route.split('/');
        if (translate.getLangs().includes(parts[1])) {
          translate.use(parts[1]);
        }
      }
    });


  }


  title = 'Search Assessment Tool';

}


