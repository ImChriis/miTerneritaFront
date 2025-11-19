import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { DrinksService } from '../../@core/services/drinks.service';
import { Observable, tap } from 'rxjs';
import { Drink } from '../../@core/models/drink.model';
import { environment } from '../../../environments/environment.developer';
import { AsyncPipe, CommonModule } from '@angular/common';
import { EventsService } from '../../@core/services/events.service';

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
  private route = inject(ActivatedRoute);
  private eventsService = inject(EventsService);
  idEvent!: number;
  drinks$!: Observable<Drink[]>;
  apiImg: string = environment.apiImg;
  name!: string;
  wallpaper!: string;


  ngOnInit(): void {
    this.drinks$ = this.drinksService.getAllDrinks();

    this.idEvent = Number(this.route.snapshot.paramMap.get('id'));

    this.eventsService.getEventById(this.idEvent).pipe(
      tap((event) => {
        this.name = event.name;
        const candidate = (event as any).image1 ?? (event as any).flyer ?? (event as any).image ?? (event as any).imagen ?? '';
        this.wallpaper = this.getFullUrl(candidate);
      })
    ).subscribe();
  }

    private getFullUrl(path: string): string {
      if (!path) return '';
      // absolute URL
      if (/^https?:\/\//i.test(path)) return path;
      if (/^(assets\/|\/)/.test(path)) return path;
      return `${environment.apiImg}/${path}`;
    }
}
