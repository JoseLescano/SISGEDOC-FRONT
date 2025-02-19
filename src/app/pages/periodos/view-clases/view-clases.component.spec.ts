import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClasesComponent } from './view-clases.component';

describe('ViewClasesComponent', () => {
  let component: ViewClasesComponent;
  let fixture: ComponentFixture<ViewClasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewClasesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewClasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
