import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.css']
})
export class LanguageComponent implements OnInit {
  constructor(private activatedRoute : ActivatedRoute, private translate: TranslateService, private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe( (params : Params) => {
      if ( params['lang'] == 'en' || params['lang'] == 'fr') {
        this.translate.use( params['lang'] );
      } else {
        this.translate.use( params['en'] );
        this.router.navigate(['/en']);
      }
    });    
  }

}
