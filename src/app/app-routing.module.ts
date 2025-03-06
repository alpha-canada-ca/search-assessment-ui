import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssessmentComponent } from './components/assessment/assessment.component';
import { UrlAssessmentComponent } from './components/url-assessment/url-assessment.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth';
import { LanguageComponent } from './components/language/language.component';
import { HomeComponent } from './components/home/home.component';
import { DepartmentResolverService } from './resolvers/department-resolver.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot([
      {
        path: ':lang', component: LanguageComponent,
        children: [
          { path: 'assessment', component: AssessmentComponent,
            resolve: {
              departments: DepartmentResolverService
            },
            data: { source: 'myValue' }
           },
          { path: 'urlAssessment', component: UrlAssessmentComponent },
          { path: 'login', component: LoginComponent },
          {
            path: 'home', component: HomeComponent,
            resolve: {
              departments: DepartmentResolverService
            }
          },
          {
            path: 'admin', canActivate: [AuthGuard], component: AdminComponent,
            resolve: {
              departments: DepartmentResolverService
            }
          },
          { path: '**', redirectTo: 'home', pathMatch: 'full' }
        ]
      },
      { path: '**', redirectTo: 'en/', pathMatch: 'full' }
    ], { onSameUrlNavigation: 'reload' })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
