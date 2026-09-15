import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucceededPaymentModalComponent } from './succeeded-payment-modal.component';

describe('SucceededPaymentModalComponent', () => {
  let component: SucceededPaymentModalComponent;
  let fixture: ComponentFixture<SucceededPaymentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SucceededPaymentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SucceededPaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
