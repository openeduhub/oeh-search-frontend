import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFilterbarComponent } from './search-filterbar.component';

describe('SearchFilterbarComponent', () => {
  let component: SearchFilterbarComponent;
  let fixture: ComponentFixture<SearchFilterbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFilterbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFilterbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
