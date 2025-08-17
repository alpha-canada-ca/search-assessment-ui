import { Injectable, inject } from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { StorageService } from 'src/app/services/storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    lang: string = "";
    constructor(private router: Router, private storageService: StorageService, private translate: TranslateService) {
        this.lang = this.translate.currentLang;
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.storageService.isLoggedIn()) {
            return true;
        } else {
            this.router.navigate([this.lang + '/login']);
            return false;
        }
    }
}