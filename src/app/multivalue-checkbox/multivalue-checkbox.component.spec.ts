import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultivalueCheckboxComponent } from './multivalue-checkbox.component';

describe('MultivalueCheckboxComponent', () => {
  let component: MultivalueCheckboxComponent;
  let fixture: ComponentFixture<MultivalueCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultivalueCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultivalueCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
