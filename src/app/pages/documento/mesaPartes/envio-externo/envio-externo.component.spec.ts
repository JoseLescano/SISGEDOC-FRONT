import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvioExternoComponent } from './envio-externo.component';

describe('EnvioExternoComponent', () => {
  let component: EnvioExternoComponent;
  let fixture: ComponentFixture<EnvioExternoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnvioExternoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvioExternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
