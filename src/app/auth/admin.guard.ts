import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {StorageService} from '../services/storage.service';
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
    lang: string = "";

    constructor(
        private storage: StorageService,
        private router: Router,
        private translate: TranslateService) {
        this.lang = this.translate.currentLang;
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const isAdmin = this.storage.getToken() != null
            && this.storage.isAdmin();

        if (!isAdmin) {
            this.router.navigate([this.lang + '/login']);
            return false;
        }
        return true;
    }
}