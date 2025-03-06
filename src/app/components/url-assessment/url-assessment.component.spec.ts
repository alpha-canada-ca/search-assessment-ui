import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlAssessmentComponent } from './url-assessment.component';

describe('UrlAssessmentComponent', () => {
  let component: UrlAssessmentComponent;
  let fixture: ComponentFixture<UrlAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrlAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
