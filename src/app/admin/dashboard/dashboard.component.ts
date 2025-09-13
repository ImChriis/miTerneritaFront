// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-dashboard',
//   imports: [],
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.scss'
// })
// export class DashboardComponent implements OnInit{
//    ngOnInit(): void {
//     // Renderiza los gráficos cuando el componente se inicializa y el DOM está listo
//     this.renderCharts();
//   }

//   renderCharts(): void {
//     const barCtx = document.getElementById('barChart') as HTMLCanvasElement;
//     const doughnutCtx = document.getElementById('doughnutChart') as HTMLCanvasElement;

//     // Datos y opciones para el gráfico de barras
//     new Chart(barCtx, {
//       type: 'bar',
//       data: {
//         labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
//         datasets: [{
//           label: 'Ventas ($)',
//           data: [120, 190, 300, 500, 200, 350],
//           backgroundColor: 'rgba(75, 192, 192, 0.6)',
//           borderColor: 'rgba(75, 192, 192, 1)',
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         }
//       }
//     });

//      new Chart(doughnutCtx, {
//       type: 'doughnut',
//       data: {
//         labels: ['Nuevos Clientes', 'Clientes Recurrentes', 'Clientes VIP'],
//         datasets: [{
//           label: 'Distribución de Clientes',
//           data: [300, 500, 100],
//           backgroundColor: [
//             'rgba(255, 99, 132, 0.6)',
//             'rgba(54, 162, 235, 0.6)',
//             'rgba(255, 206, 86, 0.6)'
//           ],
//           borderColor: [
//             'rgba(255, 99, 132, 1)',
//             'rgba(54, 162, 235, 1)',
//             'rgba(255, 206, 86, 1)'
//           ],
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true
//       }
//     });
//   }
// }
