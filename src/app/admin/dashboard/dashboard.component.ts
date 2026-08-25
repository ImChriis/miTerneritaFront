import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DashboardService } from '../../@core/services/dashboard.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    ChartModule,
    BadgeModule,
    DatePipe,
    TableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
    private dashboardService = inject(DashboardService); 
    private cd = inject(ChangeDetectorRef);
    basicData: any;
    basicOptions: any;
    platformId = inject(PLATFORM_ID);
    payments$: any[] = [];
    totalUser!: number;
    usersToday!: number;
    totalPayments!: number;
    totalTickets!: number;


    // configService = inject(AppConfigService);

   

    // themeEffect = effect(() => {
    //     if (this.configService.transitionComplete()) {
    //         if (this.designerService.preset()) {
    //             this.initChart();
    //         }
    //     }
    // });

    ngOnInit() {
        this.initChart();

        forkJoin({
            totalUser: this.dashboardService.getTotalUsers(),
            usersToday: this.dashboardService.getNewUsers(),
            totalPayments: this.dashboardService.getTotalInvoices(),
            totalTickets: this.dashboardService.getTotalTickets()
        }).subscribe({
            next: (results: any) => {
                console.log('Dashboard data:', results);
                this.totalUser = results.totalUser.length;
                this.totalPayments = results.totalPayments.length;
                this.totalTickets = results.totalTickets.count;
                this.usersToday = results.usersToday[0] || 0;

                console.log('Total Payments:', this.totalPayments);
                console.log('Total Tickets:', this.totalTickets);
                console.log('Users Today:', this.usersToday);
            }
        })
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            this.basicData = {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [
                    {
                        label: 'Sales',
                        data: [540, 325, 702, 620],
                        backgroundColor: [
                            'rgba(249, 115, 22, 0.2)',
                            'rgba(6, 182, 212, 0.2)',
                            'rgb(107, 114, 128, 0.2)',
                            'rgba(139, 92, 246, 0.2)',
                        ],
                        borderColor: ['rgb(249, 115, 22)', 'rgb(6, 182, 212)', 'rgb(107, 114, 128)', 'rgb(139, 92, 246)'],
                        borderWidth: 1,
                    },
                ],
            };

            this.basicOptions = {
                plugins: {
                    legend: {
                        labels: {
                            color: 'white',
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white',
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'white',
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                },
            };
            this.cd.markForCheck()
        }
    }
  
}
