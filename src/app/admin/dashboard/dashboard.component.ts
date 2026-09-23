import { AsyncPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DashboardService } from '../../@core/services/dashboard.service';
import { finalize, forkJoin, map, Observable, startWith, switchMap, tap } from 'rxjs';
import { PaymentService } from '../../@core/services/payment.service';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UpdatePaymentComponent } from '../payments/components/update-payment/update-payment.component';
import { Payment } from '../../@core/models/payment.model';

type Filter = 'day' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-dashboard',
  imports: [
    ChartModule,
    BadgeModule,
    DatePipe,
    TableModule,
    AsyncPipe,
    FormsModule,
    SelectButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
    private dashboardService = inject(DashboardService); 
    private paymentsService = inject(PaymentService);
    private cd = inject(ChangeDetectorRef);
    private dialogService = inject(DialogService);
    ref: DynamicDialogRef | undefined;
    platformId = inject(PLATFORM_ID);
    
    userChartData: any;
    usersChartOptions: any;
    basicData: any;
    basicOptions: any;
    payments$!: Observable<any[]>;
    allPayments: any[] = [];
    allUsers: any[] = [];

    totalUser!: number;
    usersToday!: number;
    totalPayments!: number;
    totalTickets!: number;
    
    isModalOpen!: false;

    selectedFilter: Filter = 'month';
    selectedUserFilter: Filter = 'month';
    filterOptions = [
        { label: 'Día', value: 'day' },
        { label: 'Semana', value: 'week' },
        { label: 'Mes', value: 'month' },
        { label: 'Año', value: 'year' }
    ]

    ngOnInit() {
        this.initChart();

        this.payments$ = this.paymentsService.refreshPaymentsObservable$.pipe(
        startWith(null),
        switchMap(() => {
            // this.isLoading.set(true);
            
            return this.paymentsService.getAllPayments().pipe(
            tap((payments: any[]) => {
                // Guardamos todos los pagos para los gráficos
                this.allPayments = payments || [];
                this.updateChartData(this.selectedFilter);
            }),
            map((payments: any[]) => {
                // Filtramos para la tabla los últimos 5
                return (payments || [])
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);
            }),
            finalize(() => {
                // Apaga el estado de carga al finalizar la petición HTTP
                // this.isLoading.set(false);
            })
            );
        })
        );

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
                this.usersToday = results.usersToday.length || 0;
                this.allUsers = results.totalUser || [];

                this.updateUsersChart(this.selectedFilter);

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
  
    onPeriodChange(period: Filter) {
    this.selectedFilter = period;
    this.updateChartData(period);
  }

  onUserPeriodChange(period: Filter) {
    this.selectedUserFilter = period;
    this.updateUsersChart(period);
  }

  private updateChartData(period: Filter) {
    if (!this.allPayments || this.allPayments.length === 0) return;

    const groupedData: { [key: string]: number } = {};

    this.allPayments.forEach((payment) => {
      const pDate = new Date(payment.date);
      let key = '';

      switch (period) {
        case 'day':
          // Formato: YYYY-MM-DD
          key = pDate.toISOString().split('T')[0];
          break;
        case 'week': {
          // Obtener número de semana del año
          const firstDayOfYear = new Date(pDate.getFullYear(), 0, 1);
          const pastDaysOfYear = (pDate.getTime() - firstDayOfYear.getTime()) / 86400000;
          const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          key = `Sem ${weekNum} (${pDate.getFullYear()})`;
          break;
        }
        case 'month': {
          // Formato: Mes Año (ej. "Ene 2026")
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          key = `${months[pDate.getMonth()]} ${pDate.getFullYear()}`;
          break;
        }
        case 'year':
          key = `${pDate.getFullYear()}`;
          break;
      }

      // Sumar monto de pago o conteo (ajusta 'payment.amount' si tu API usa otro campo)
      const value = payment.amount ? Number(payment.amount) : 1;
      groupedData[key] = (groupedData[key] || 0) + value;
    });

    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);

    this.basicData = {
      labels: labels,
      datasets: [
        {
          label: `Pagos`,
          data: data,
          backgroundColor: 'rgba(249, 115, 22, 0.4)',
          borderColor: 'rgb(249, 115, 22)',
          borderWidth: 1
        }
      ]
    };

    this.cd.markForCheck();
  }

  private updateUsersChart(period: Filter) {
    if (!this.allUsers || this.allUsers.length === 0) return;
    // Si tu modelo usa 'createdAt' u otra propiedad de fecha para el usuario, ajústala aquí:
    const grouped = this.groupDataByDate(this.allUsers, period, 'createdAt');

    this.userChartData = {
      labels: Object.keys(grouped),
      datasets: [
        {
          label: `Nuevos Usuarios`,
          data: Object.values(grouped),
          backgroundColor: 'rgba(6, 182, 212, 0.4)',
          borderColor: 'rgb(6, 182, 212)',
          borderWidth: 1
        }
      ]
    };
    this.cd.markForCheck();
  }

  private groupDataByDate(items: any[], period: Filter, dateField: string) {
    const groupedData: { [key: string]: number } = {};

    items.forEach((item) => {
      const rawDate = item[dateField] ? new Date(item[dateField]) : new Date();
      let key = '';

      switch (period) {
        case 'day':
          key = rawDate.toISOString().split('T')[0];
          break;
        case 'week': {
          const firstDayOfYear = new Date(rawDate.getFullYear(), 0, 1);
          const pastDaysOfYear = (rawDate.getTime() - firstDayOfYear.getTime()) / 86400000;
          const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          key = `Sem ${weekNum} (${rawDate.getFullYear()})`;
          break;
        }
        case 'month': {
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          key = `${months[rawDate.getMonth()]} ${rawDate.getFullYear()}`;
          break;
        }
        case 'year':
          key = `${rawDate.getFullYear()}`;
          break;
      }

      groupedData[key] = (groupedData[key] || 0) + 1;
    });

    return groupedData;
  }

  openUpdateModal(payment: Payment) {
    //   this.isModalOpen = true;
      this.ref = this.dialogService.open(UpdatePaymentComponent, {
        header: 'Actualizar pago',
        width: '90%',
        // height: '65vh',
        modal: true,
        closable: true,
        data: { payment },
         breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
        styleClass: 'custom-dialog'
      });
      this.ref.onClose.subscribe(() => {
        this.isModalOpen = false;
      });
    }
}
