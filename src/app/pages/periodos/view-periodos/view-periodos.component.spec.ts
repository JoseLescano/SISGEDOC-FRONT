import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPeriodosComponent } from './view-periodos.component';

describe('ViewPeriodosComponent', () => {
  let component: ViewPeriodosComponent;
  let fixture: ComponentFixture<ViewPeriodosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPeriodosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPeriodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
