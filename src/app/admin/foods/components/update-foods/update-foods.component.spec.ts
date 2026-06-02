import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFoodsComponent } from './update-foods.component';

describe('UpdateFoodsComponent', () => {
  let component: UpdateFoodsComponent;
  let fixture: ComponentFixture<UpdateFoodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateFoodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateFoodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
