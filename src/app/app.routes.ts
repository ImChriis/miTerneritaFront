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
            path: 'forgotPassword',
            loadComponent: () => import('./@core/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
            title: 'Forgot Password'
        },
        {
            path: 'home/event/:id',
            loadComponent: () => import('./pages/event/event.component').then(m => m.EventComponent),
            title: 'Event'
        },
        {
            path:'home/contact',
            loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
            title: 'Contact'
        }
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
            title: 'Inicio'
        },
        {
            path: 'login',
            loadComponent: () => import('./@core/auth/login/login.component').then(m => m.LoginComponent),
            title: 'Iniciar Sesión'
        },
        {
            path: 'register',
            loadComponent: () => import('./@core/auth/register/register.component').then(m => m.RegisterComponent),
            title: 'Registrarse'
        },
        {
            path: 'home/event/:id',
            loadComponent: () => import('./pages/event/event.component').then(m => m.EventComponent),
            title: 'Evento'
        },
        {
            path: 'home/event/:id/ticket',
            loadComponent: () => import('./pages/ticket/ticket.component').then(m => m.TicketComponent),
            title: 'Entrada'
        },
        {
            path: 'home/event/:id/ticket/consume',
            loadComponent: () => import('./pages/consume/consume.component').then(m => m.ConsumeComponent),
            title: 'Consumo'
        },
        {
            path: 'home/event/:id/ticket/checkout',
            loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
            title: 'Confirmación de Compra'
        },
        {
            path: 'home/event/:id/ticket/checkout/payment',
            loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
            title: 'Pago'
        },
        {
            path: 'home/profile',
            loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
            title: 'Perfil'
        },
        {
            path: 'home/contact',
            loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
            title: 'Contacto'
        },
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
        title: 'Eventos'
    },
    {
        path: 'tickets',
        loadComponent: () => import('./admin/tickets/tickets.component').then(m => m.TicketsComponent),
        title: 'Entradas'
    },
    {
        path: 'payments',
        loadComponent: () => import('./admin/payments/payments.component').then(m => m.PaymentsComponent),
        title: 'Pagos'
    },
    {
        path: 'drinks',
        loadComponent: () => import('./admin/drinks/drinks.component').then(m => m.DrinksComponent),
        title: 'Bebidas'
    },
    {
        path: 'foods',
        loadComponent: () => import('./admin/foods/foods.component').then(m => m.FoodsComponent),
        title: 'Comidas'
    },
    {
        path: 'settings',
        loadComponent: () => import('./admin/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Configuración'
    },
    {
        path: 'users',
        loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent),
        title: 'Usuarios'
    },
  ]
}

];

