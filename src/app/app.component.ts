import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule
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
