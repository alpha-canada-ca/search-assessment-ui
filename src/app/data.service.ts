import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Department } from './components/admin/admin.component';

const LAST_UPDATE_SERVICE = 'lastUpdate';
const AVAILABLE_DATES_SERVICE = 'availableDates';
const DEPARTMENTS_SERVICE = 'departments';
const ANALYZE_SERVICE = 'analyze';
const GET_ASSESSMENT_SERVICE = 'assessment';
const GET_URL_ASSESSMENT_SERVICE = 'urlAssessment';
const USER_SERVICE = 'validateUser';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getLastUpdate(source: string, lang: string) {
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
      return this.http.get(environment.ANALYSIS_API_URL + '/' + LAST_UPDATE_SERVICE, { 'params': params });
    }

    return this.http.get(environment.ANALYSIS_API_URL + '/' + LAST_UPDATE_SERVICE);
  }

  getAvailableDates(source: string, lang: string) {
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
      return this.http.get(environment.ANALYSIS_API_URL + '/' + AVAILABLE_DATES_SERVICE, { 'params': params });
    }

    return this.http.get(environment.ANALYSIS_API_URL + '/' + AVAILABLE_DATES_SERVICE);
  }

  getDepartments() {
    return this.http.get(environment.ANALYSIS_API_URL + '/' + DEPARTMENTS_SERVICE);
  }
  addDepartment(department: Department) {
    var params = new HttpParams()
    .set('nameEn', department.nameEn)
    .set('nameFr', department.nameFr)
    .set('acronymEn', department.acronymEn)
    .set('acronymFr', department.acronymFr);

    if (department.urlEn) {
      params = params.set('urlEn', department.urlEn);
    }

    if (department.urlFr) {
      params = params.set('urlFr', department.urlFr);
    }

    return this.http.post(environment.ANALYSIS_API_URL + '/' + DEPARTMENTS_SERVICE, null, { 'params': params });
  }


  getAssessment(source: string, lang: string, date: string) {
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

    if (date) {
      params = params.append('date', date);
      isParams = true;
    }

    if (isParams) {
      return this.http.get(environment.ANALYSIS_API_URL + '/' + GET_ASSESSMENT_SERVICE, { 'params': params });
    }

    return this.http.get(environment.ANALYSIS_API_URL + '/' + GET_ASSESSMENT_SERVICE);

  }

  getUrlAssessment(source: string, lang: string, url: string) {
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

    if (url) {
      params = params.append('url', url);
      isParams = true;
    }

    if (isParams) {
      return this.http.get(environment.ANALYSIS_API_URL + '/' + GET_URL_ASSESSMENT_SERVICE, { 'params': params });
    }

    return this.http.get(environment.ANALYSIS_API_URL + '/' + GET_URL_ASSESSMENT_SERVICE);

  }

  downloadAssessment(source: string, lang: string, date: string, format: string) {
    var params = new HttpParams();

    if (source) {
      params = params.append('source', source);
    }
    if (lang) {
      params = params.append('lang', lang);
    }

    if (date) {
      params = params.append('date', date);
    }

    if (format) {
      params = params.append('format', format);
    }

    return this.http.get(environment.ANALYSIS_API_URL + '/' + GET_ASSESSMENT_SERVICE, { 'params': params, responseType: 'blob' as 'json' });
    
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

  validateUser(username: string, password: string) {
    var params = new HttpParams();

    if (username) {
      params = params.append('username', username);
    }
    if (password) {
      params = params.append('password', password);
    }

    return this.http.get(environment.ANALYSIS_API_URL + '/' + USER_SERVICE, { 'params': params });

  }

  defaultSearchType(department: Department) {
    if (department.urlEn == null) {
      return "global";
    }
    return "contextual";
  }

}
