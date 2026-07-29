import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SettingsService } from '../services/settings.service';


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
export class LayoutComponent implements OnInit {
  private ruoter = inject(Router);
  private settingsService = inject(SettingsService);
  showMobileMenu = false;
  authService = inject(AuthService);
  instagram!: string;
  tiktok!: string;
  whatsapp!: string;

  ngOnInit(){
        this.settingsService.getSettings().subscribe((data: any) => {
        this.instagram = data.instagram;
        this.tiktok = data.tiktok;
        this.whatsapp = data.whatsapp;
      })
  }

  get user(){
    return this.authService.getUser();
  }

  goToEvents(){
    this.ruoter.navigate(['/'], { fragment: 'events-section' });
  }
}
