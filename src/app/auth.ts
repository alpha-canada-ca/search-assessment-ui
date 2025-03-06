import { Injectable, inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { StorageService } from 'src/app/storage.service';

@Injectable({
    providedIn: 'root'
})
class PermissionsService {
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

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {

    return inject(PermissionsService).canActivate(next, state);
}