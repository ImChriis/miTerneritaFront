import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFoodsComponent } from './create-foods.component';

describe('CreateFoodsComponent', () => {
  let component: CreateFoodsComponent;
  let fixture: ComponentFixture<CreateFoodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFoodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFoodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
