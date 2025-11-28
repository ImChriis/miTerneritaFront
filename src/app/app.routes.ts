import { Routes } from '@angular/router';
import { LayoutComponent } from './@core/layout/layout.component';
import { AdminLayoutComponent } from './@core/admin-layout/admin-layout.component';
import { AuthGuard } from './@core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
        {
            path: '',
            loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
            title: 'Home'
        },
        {
            path: 'login',
            loadComponent: () => import('./@core/auth/login/login.component').then(m => m.LoginComponent),
            title: 'Login'
        },
        {
            path: 'register',
            loadComponent: () => import('./@core/auth/register/register.component').then(m => m.RegisterComponent),
            title: 'Register'
        },
        {
            path: 'home/event/:id',
            loadComponent: () => import('./pages/event/event.component').then(m => m.EventComponent),
            title: 'Event'
        },
        ]
    },
    {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
        {
            path: '',
            loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
            title: 'Home'
        },
        {
            path: 'login',
            loadComponent: () => import('./@core/auth/login/login.component').then(m => m.LoginComponent),
            title: 'Login'
        },
        {
            path: 'register',
            loadComponent: () => import('./@core/auth/register/register.component').then(m => m.RegisterComponent),
            title: 'Register'
        },
        {
            path: 'home/event/:id',
            loadComponent: () => import('./pages/event/event.component').then(m => m.EventComponent),
            title: 'Event'
        },
        {
            path: 'home/event/:id/ticket',
            loadComponent: () => import('./pages/ticket/ticket.component').then(m => m.TicketComponent),
            title: 'Ticket'
        },
        {
            path: 'home/event/:id/ticket/consume',
            loadComponent: () => import('./pages/consume/consume.component').then(m => m.ConsumeComponent),
            title: 'Consume'
        },
        {
            path: 'home/event/:id/ticket/checkout',
            loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
            title: 'Checkout'
        },
        {
            path: 'home/event/:id/ticket/checkout/payment',
            loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
            title: 'Payment'
        }
    ],

},

{
  path: 'admin',
  component: AdminLayoutComponent,
  canActivate: [AuthGuard],
  children:[
    {
      path:'dashboard',
      loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      title: 'Dashboard'
    },
    {
        path: 'events',
        loadComponent: () => import('./admin/events/events.component').then(m => m.EventsComponent),
        title: 'Events'
    },
    {
        path: 'tickets',
        loadComponent: () => import('./admin/tickets/tickets.component').then(m => m.TicketsComponent),
        title: 'Tickets'
    },
    {
        path: 'payments',
        loadComponent: () => import('./admin/payments/payments.component').then(m => m.PaymentsComponent),
        title: 'Payments'
    },
    {
        path: 'drinks',
        loadComponent: () => import('./admin/drinks/drinks.component').then(m => m.DrinksComponent),
        title: 'Drinks'
    },
    {
        path: 'settings',
        loadComponent: () => import('./admin/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings'
    }
  ]
}

];

