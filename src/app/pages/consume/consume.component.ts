import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { DrinksService } from '../../@core/services/drinks.service';
import { Observable, tap } from 'rxjs';
import { Drink } from '../../@core/models/drink.model';
import { environment } from '../../../environments/environment.developer';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-consume',
  imports: [
    TabsModule,
    RouterLink,
   CommonModule,
  //  AsyncPipe
],
  templateUrl: './consume.component.html',
  styleUrl: './consume.component.scss'
})
export class ConsumeComponent implements OnInit{
  private drinksService = inject(DrinksService);
  drinks$!: Observable<any> | undefined;
  apiImg: string = environment.apiImg

  ngOnInit(): void {
    this.drinks$ = this.drinksService.getAllDrinks();
  }
}
