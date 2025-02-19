import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccionesComponent } from './view-acciones.component';

describe('ViewAccionesComponent', () => {
  let component: ViewAccionesComponent;
  let fixture: ComponentFixture<ViewAccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAccionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
