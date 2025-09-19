import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  // title = 'miternerita-front';

  isLoading = true;

  ngOnInit() {
    // Simulate a loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
