import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DepartmentResolverService implements Resolve<any> {

  constructor(private dataSevice: DataService) { }
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.dataSevice.getDepartments();
  }
  
}
