import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommuterSignup } from './commuter-signup';

describe('CommuterSignup', () => {
  let component: CommuterSignup;
  let fixture: ComponentFixture<CommuterSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommuterSignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommuterSignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});