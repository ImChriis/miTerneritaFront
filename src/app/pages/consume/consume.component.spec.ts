import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumeComponent } from './consume.component';

describe('ConsumeComponent', () => {
  let component: ConsumeComponent;
  let fixture: ComponentFixture<ConsumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
