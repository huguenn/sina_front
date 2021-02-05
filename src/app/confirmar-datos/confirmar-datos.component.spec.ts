import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarDatosComponent } from './confirmar-datos.component';

describe('ConfirmarDatosComponent', () => {
  let component: ConfirmarDatosComponent;
  let fixture: ComponentFixture<ConfirmarDatosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmarDatosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
