import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventsService } from '../../@core/services/events.service';
import { environment } from '../../../environments/environment.developer';

@Component({
  selector: 'app-event',
  imports: [],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit{
  private eventsService = inject(EventsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  idEvent!: number;
  wallpaper: string = '';
  description!: string;
  date!: Date;
  time!: string;
  name!: string;
  idEvents!: number;

  ngOnInit() {
    this.idEvent = Number(this.route.snapshot.paramMap.get('id'));

    document.body.style.backgroundImage = `url(${this.wallpaper})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';

    this.eventsService.getEventById(this.idEvent).subscribe({
      next: (event) => {
        this.description = event.description;
        this.date = event.date;
        this.time = event.time;
        this.name = event.name;
        this.idEvents = event.idEvents;
        const candidate = (event as any).image1 ?? (event as any).flyer ?? (event as any).image ?? (event as any).imagen ?? '';
        this.wallpaper = this.getFullUrl(candidate);
        document.body.style.backgroundImage = `url(${this.wallpaper})`;
      }
    });
  }

  private getFullUrl(path: string): string {
    if (!path) return '';
    // absolute URL
    if (/^https?:\/\//i.test(path)) return path;
    if (/^(assets\/|\/)/.test(path)) return path;
    return `${environment.apiImg}/${path}`;
  }

  goToEventTicket(idEvents: number){
    console.log("click")
    this.router.navigate(['/home/event/' + idEvents + '/ticket']);
  }
}
