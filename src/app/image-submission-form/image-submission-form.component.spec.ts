import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSubmissionFormComponent } from './image-submission-form.component';

describe('ImageSubmissionFormComponent', () => {
  let component: ImageSubmissionFormComponent;
  let fixture: ComponentFixture<ImageSubmissionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageSubmissionFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageSubmissionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
