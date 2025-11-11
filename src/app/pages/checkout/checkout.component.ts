import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout',
  imports: [
    RouterLink
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit{
  private route = inject(ActivatedRoute);
  idEvents!: number;
  selected: any[] = [];

  ngOnInit() {
    this.idEvents = Number(this.route.snapshot.paramMap.get('id'));

    this.selected = history.state.selected;
    console.log('Selected data:', this.selected);
  }
}
