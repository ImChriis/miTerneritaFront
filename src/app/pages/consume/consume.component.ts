import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-consume',
  imports: [
    TabsModule,
    RouterLink
  ],
  templateUrl: './consume.component.html',
  styleUrl: './consume.component.scss'
})
export class ConsumeComponent {

}
