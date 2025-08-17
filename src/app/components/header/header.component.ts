import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {StorageService} from 'src/app/services/storage.service';
import { Subscription, forkJoin, Observable, combineLatest } from "rxjs";
import { filter, switchMap, startWith } from 'rxjs/operators'; // 'take' and 'map' are no longer needed here
import {AuthService} from "../../services/auth.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {

    lang: string = 'en';
    route: string = "";
    isLoggedIn: boolean = false;
    isAdmin: boolean = false;
    dateModified: string = "2025-07-10";
    private menuTranslations: any = {};

    private authSubscription: Subscription | undefined;
    private langChangeSubscription: Subscription | undefined;


    constructor(private titleService: Title, private translate: TranslateService, location: Location,
                private router: Router, private storageService: StorageService, private renderer2: Renderer2,
                private authService: AuthService) {
        this.router.events.subscribe((val) => {
            if (location.path() != '') {
                this.route = location.path();
            }
            const parts = this.route.split('/');
            if (translate.getLangs().includes(parts[1])) {
                this.route = parts.slice(2).join('/');
            } else {
                this.route = "";
            }
        });

    }


    ngOnInit() {
        // A stream that provides profile updates, but only *after* the initial
        // authentication check is complete.
        const profileUpdates$ = this.authService.isAuthCheckInProgress$.pipe(
            filter(isLoading => isLoading === false), // Wait for the initial check to finish
            // Once the check is done, switch to the userProfile$ stream and listen for all its updates
            switchMap(() => this.authService.userProfile$)
        );

        // This stream for translations remains the same and is correct.
        const translations$ = this.translate.onLangChange.pipe(
            startWith({ lang: this.translate.currentLang || 'en' }),
            switchMap(event => {
                this.lang = event.lang;
                const translationKeys = {
                    title: 'GENERAL.TITLE',
                    langSwitch: 'GENERAL.LANG_SWITCH',
                    home: 'GENERAL.HOME',
                    searchAssessment: 'SCORE.TITLE',
                    urlAssessment: 'URL.TITLE',
                    listManager: 'GENERAL.LIST_MANAGER',
                    admin: 'GENERAL.ADMIN'
                };
                return forkJoin(
                    Object.keys(translationKeys).reduce((acc: { [key: string]: Observable<string> }, key: string) => {
                        const typedKey = key as keyof typeof translationKeys;
                        acc[typedKey] = this.translate.get(translationKeys[typedKey]);
                        return acc;
                    }, {})
                );
            })
        );

        // Combine the streams. This will now fire on initial load AND on subsequent logins/logouts.
        this.authSubscription = combineLatest([profileUpdates$, translations$])
            .subscribe(([profile, translations]) => {

                this.isLoggedIn = !!profile;
                this.isAdmin = profile?.admin || false;
                this.menuTranslations = translations;

                this.loadScripts();
            });
    }

    ngOnDestroy() {
        this.authSubscription?.unsubscribe();
        this.langChangeSubscription?.unsubscribe();
    }


    loadScripts() {
        // First, clean up any old WET script to prevent conflicts
        const oldScript = document.querySelector('script[data-cdts-setup]');
        if (oldScript) {
            oldScript.remove();
        }

        const wetScript = 'https://www.canada.ca/etc/designs/canada/cdts/gcweb/rn/cdts/compiled/wet-' + this.lang + '.js';
        const invLang = this.lang == "fr" ? "en" : "fr";
        const signButtonUrl = `/${this.lang}/login${this.isLoggedIn ? '?isLogout=true' : ''}`;

        const data: any = {
            "mode": "app",
            "cdnEnv": "prod",
            "top": {
                "breadcrumbs": [{"title": this.menuTranslations.home, "href": this.lang}],
                "appName": [{"text": this.menuTranslations.title, "href": `/${this.lang}/`}],
                "lngLinks": [{
                    "lang": invLang,
                    "href": `/${invLang}/${this.route}`,
                    "text": this.menuTranslations.langSwitch
                }],
                "menuLinks": [
                    {"href": `/${this.lang}/`, "text": this.menuTranslations.searchAssessment},
                    {"href": `/${this.lang}/urlAssessment`, "text": this.menuTranslations.urlAssessment},
                    {"href": `/${this.lang}/list`, "text": this.menuTranslations.listManager}
                ]
            },
            "preFooter": {"showFeedback": false, "showShare": false, "dateModified": this.dateModified},
            "footer": {"showFooter": true}
        };

        if (!this.route.startsWith("login")) {
            if (this.isLoggedIn) {
                data.top.signOut = [{"href": signButtonUrl}];
            } else {
                data.top.signIn = [{"href": signButtonUrl}];
            }
        }

        if (this.isLoggedIn && this.isAdmin) {
            data.top.menuLinks.push({
                "href": `/${this.lang}/admin`,
                "text": this.menuTranslations.admin
            });
        }

        const node = this.renderer2.createElement('script');
        node.src = wetScript;
        this.renderer2.setAttribute(node, 'data-cdts-setup', JSON.stringify(data));
        this.renderer2.appendChild(document.head, node);

    }

}
