import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../../@core/services/events.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.developer';


@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule
],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit{
  private eventsService = inject(EventsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  idEvents!: number;
  selected: any[] = [];
  name!: string;
  total!: number;
  event: any = {};
  wallpaper!: string;

  userData = this.fb.group({
    name: [''],
    lastName: [''],
    email: [''],
    phone: [''],
    identification: ['']
  })

  
ngOnInit() {
    this.idEvents = Number(this.route.snapshot.paramMap.get('id'));
    this.selected = history.state.selected;
    this.total = this.selected.reduce((acc, item) => acc + item.total, 0);

    this.eventsService.getEventById(this.idEvents).subscribe({
      next: (event) => {
        this.name = event.name;
        this.event = event;

        const candidate =
          (event as any).image1 ??
          (event as any).flyer ??
          (event as any).image ??
          (event as any).imagen ??
          '';

        this.wallpaper = this.getFullUrl(candidate);

        document.body.style.backgroundImage = `url(${this.wallpaper})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
      }
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user) {
      this.userData.patchValue({
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        identification: user.cedula
      });
    }
  }

    ngOnDestroy() {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
  }

   private getFullUrl(path: string): string {
        if (!path) return '';
        // absolute URL
        if (/^https?:\/\//i.test(path)) return path;
        if (/^(assets\/|\/)/.test(path)) return path;
        return `${environment.apiImg}/${path}`;
      }

  proceedToPayment(){
    const paymentData = {
      user: this.userData.value,
      total: this.total,
      ticket: this.selected,
      event: this.event
    }

    console.log("paymentData to send:", paymentData);

    this.router.navigate(['/home/event/' + this.idEvents + "/ticket/checkout/payment"], { state: paymentData });  
  }
}
