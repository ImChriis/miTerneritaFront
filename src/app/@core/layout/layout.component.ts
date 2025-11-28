import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule
],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private ruoter = inject(Router);
  showMobileMenu = false;
  authService = inject(AuthService);

  get user(){
    return this.authService.getUser();
  }

  goToEvents(){
    this.ruoter.navigate(['/'], { fragment: 'events-section' });
  }
}
