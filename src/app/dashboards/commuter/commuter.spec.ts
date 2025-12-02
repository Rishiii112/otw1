import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Commuter } from './commuter';

describe('Commuter', () => {
  let component: Commuter;
  let fixture: ComponentFixture<Commuter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Commuter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Commuter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
