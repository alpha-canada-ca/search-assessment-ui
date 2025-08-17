import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {Department, UserRequest} from '../components/admin/admin.component';
import {Observable} from "rxjs";
import {Assessment, AssessmentResponse, Match, TermList} from "../components/assessment/assessment.component";
import {CreateListRequest, CreateTermRequest, List, Term} from "../components/list/list.component";
import {UserProfile} from "../components/login/login.component";
import {UrlAssessmentResponse} from "../components/url-assessment/url-assessment.component";

const DEPARTMENTS_SERVICE = 'departments';
const USERS_SERVICE = 'users';
const LISTS_SERVICE = 'lists';
const ANALYZE_SERVICE = 'analyze';
const ASSESSMENT_SERVICE = 'assessments';
const LANGUAGE_SERVICE = 'languages';

export interface Language {
  id: number;
  code: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {

  }

  getLanguage(id: number): Observable<Language> {
    return this.http.get<Language>(environment.ANALYSIS_API_URL + '/' + LANGUAGE_SERVICE + '/${id}');
  }

  listLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(environment.ANALYSIS_API_URL + '/' + LANGUAGE_SERVICE);
  }

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(environment.ANALYSIS_API_URL + '/' + USERS_SERVICE);
  }

  addUser(user: UserRequest) {
    return this.http.post(environment.ANALYSIS_API_URL + '/' + USERS_SERVICE, user);
  }

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(environment.ANALYSIS_API_URL + '/' + USERS_SERVICE + "/me");
  }

  getListsByDepartment(deptId: number): Observable<TermList[]> {
    return this.http.get<TermList[]>(environment.ANALYSIS_API_URL + '/' + LISTS_SERVICE + `/department/${deptId}`);
  }

  /** Create a new list */
  createList(req: CreateListRequest): Observable<List> {
    return this.http.post<List>(environment.ANALYSIS_API_URL + '/' + LISTS_SERVICE, req);
  }

  /** Remove a list */
  deleteList(listId: number): Observable<void> {
    return this.http.delete<void>(environment.ANALYSIS_API_URL + '/' + LISTS_SERVICE + `/${listId}`);
  }

  getListsByMe(): Observable<List[]> {
    return this.http.get<List[]>(environment.ANALYSIS_API_URL + '/' + LISTS_SERVICE + `/user/me`);
  }

  /** Fetch all terms in a list */
  listTerms(listId: number): Observable<Term[]> {
    return this.http.get<Term[]>(environment.ANALYSIS_API_URL + '/' + LISTS_SERVICE + `/${listId}/terms`);
  }

  addDepartment(department: Department) {
    return this.http.post(environment.ANALYSIS_API_URL + '/' + DEPARTMENTS_SERVICE, department);
  }


  listDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(environment.ANALYSIS_API_URL + '/' + DEPARTMENTS_SERVICE);
  }

  /** Add/update many terms at once */
  addTermsBulk(
      listId: number,
      requests: CreateTermRequest[]
  ): Observable<Term[]> {
    return this.http.post<Term[]>(
        environment.ANALYSIS_API_URL + '/' + LISTS_SERVICE + `/${listId}/terms`,
        requests
    );
  }

  upsertTermsBulk(
      listId: number,
      requests: CreateTermRequest[]
  ): Observable<Term[]> {
    return this.http.put<Term[]>(
        environment.ANALYSIS_API_URL + '/' + LISTS_SERVICE + `/${listId}/terms`,
        requests
    );
  }

  getAssessmentsByDepartment(deptId: number, langId: number): Observable<Assessment[]> {
    let params = new HttpParams();
    params = params.append('langId', langId);

    return this.http.get<Assessment[]>(environment.ANALYSIS_API_URL + '/' + ASSESSMENT_SERVICE + `/department/${deptId}`, {'params': params});
  }

  getAssessment(id: number | undefined): Observable<AssessmentResponse> {
    return this.http.get<AssessmentResponse>(environment.ANALYSIS_API_URL + '/' + ASSESSMENT_SERVICE + `/${id}`);
  }


  downloadAssessmentAsCsv(id: number | undefined) {
    let params = new HttpParams();
    params = params.append('format', 'csv');

    return this.http.get(environment.ANALYSIS_API_URL + '/' + ASSESSMENT_SERVICE + `/${id}`, { 'params': params, responseType: 'blob' as 'json' });
  }

  getUrlAssessment(url: string, deptId: number, langId: number): Observable<UrlAssessmentResponse> {
    let params = new HttpParams();
    params = params.append('url', url);
    params = params.append('deptId', deptId);
    params = params.append('langId', langId);

    return this.http.get<UrlAssessmentResponse>(environment.ANALYSIS_API_URL + '/' + ASSESSMENT_SERVICE + '/url', { 'params': params });
  }


  analyze(source: string, lang: string) {
    var params = new HttpParams();
    var isParams: boolean = false;

    if (source) {
      params = params.append('source', source);
      isParams = true;
    }

    if (lang) {
      params = params.append('lang', lang);
      isParams = true;
    }

    if (isParams) {
      return this.http.get(environment.ANALYSIS_API_URL + '/' + ANALYZE_SERVICE, { 'params': params });
    }

    return this.http.get(environment.ANALYSIS_API_URL + '/' + ANALYZE_SERVICE);

  }
}
