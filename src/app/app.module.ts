import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http'
import {AppComponent} from './app.component';
import {AssessmentComponent} from './components/assessment/assessment.component';
import {UrlAssessmentComponent} from './components/url-assessment/url-assessment.component';
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {AppRoutingModule} from './app-routing.module';
import {CommonModule} from '@angular/common';
import {AdminComponent} from './components/admin/admin.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {LanguageComponent} from './components/language/language.component';
import {LoginComponent} from './components/login/login.component';
import {HomeComponent} from './components/home/home.component';
import {AuthInterceptor} from "./auth/auth.interceptor";
import {ListComponent} from "./components/list/list.component";

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient);
}

@NgModule({
    declarations: [
        AppComponent,
        AssessmentComponent,
        UrlAssessmentComponent,
        HeaderComponent,
        FooterComponent,
        AdminComponent,
        LanguageComponent,
        LoginComponent,
        HomeComponent,
        ListComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })], providers: [
        {
            provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true
        },
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class AppModule {
}
