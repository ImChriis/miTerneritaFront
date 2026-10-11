import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { DrinksService } from '../../@core/services/drinks.service';
import { Drink } from '../../@core/models/drink.model';
import { environment } from '../../../environments/environment.developer';
import { EventsService } from '../../@core/services/events.service';
import { eventImage } from '../../@core/utils/event-utils';

@Component({
  selector: 'app-consume',
  imports: [RouterLink, AsyncPipe, DecimalPipe],
  templateUrl: './consume.component.html',
  styleUrl: './consume.component.scss'
})
export class ConsumeComponent implements OnInit {
  private drinksService = inject(DrinksService);
  private route = inject(ActivatedRoute);
  private eventsService = inject(EventsService);
  idEvent!: number;
  drinks$!: Observable<Drink[]>;
  apiImg: string = environment.apiImg;
  name = signal('');
  wallpaper = signal('');

  ngOnInit(): void {
    this.drinks$ = this.drinksService.getAllDrinks();
    this.idEvent = Number(this.route.snapshot.paramMap.get('id'));

    this.eventsService.getEventById(this.idEvent).subscribe({
      next: event => {
        this.name.set(event.name);
        this.wallpaper.set(eventImage(event.image1 || event.flyer));
      }
    });
  }
}
