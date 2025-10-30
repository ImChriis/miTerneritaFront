import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDrinksComponent } from './create-drinks.component';

describe('CreateDrinksComponent', () => {
  let component: CreateDrinksComponent;
  let fixture: ComponentFixture<CreateDrinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDrinksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDrinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
