import { TestBed } from '@angular/core/testing';

import { DepartmentResolverService } from './department-resolver.service';

describe('DepartmentResolverService', () => {
  let service: DepartmentResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmentResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
