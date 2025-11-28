import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    ToastModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  // title = 'miternerita-front';

  isLoading = true;

    constructor() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        const tree = this.router.parseUrl(this.router.url);
        const fragment = tree.fragment;
        if (fragment) {
          // dar tiempo a renderizado del componente hijo
          setTimeout(() => {
            const el = document.getElementById(fragment);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }
      }
    });
  }

  ngOnInit() {
    // Simulate a loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
