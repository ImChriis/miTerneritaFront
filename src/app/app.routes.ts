import { Routes } from '@angular/router';
import { LayoutComponent } from './@core/layout/layout.component';
import { AdminLayoutComponent } from './@core/admin-layout/admin-layout.component';
import { AdminGuard, AuthGuard } from './@core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
                title: 'Inicio'
            },
            {
                path: 'login',
                loadComponent: () => import('./@core/auth/login/login.component').then(m => m.LoginComponent),
                title: 'Iniciar sesión',
                data: { noindex: true }
            },
            {
                path: 'register',
                loadComponent: () => import('./@core/auth/register/register.component').then(m => m.RegisterComponent),
                title: 'Crear cuenta',
                data: { noindex: true }
            },
            {
                path: 'forgotPassword',
                loadComponent: () => import('./@core/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
                title: 'Recuperar contraseña',
                data: { noindex: true }
            },
            {
                path: 'home/event/:id',
                loadComponent: () => import('./pages/event/event.component').then(m => m.EventComponent),
                title: 'Evento'
            },
            {
                path: 'home/contact',
                loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
                title: 'Contacto',
                data: { description: 'Escríbenos para reservas, eventos privados o dudas con tu compra. Mi Ternerita House, Av. Fuerzas Armadas, Maracaibo.' }
            },
            {
                path: 'legal/:doc',
                loadComponent: () => import('./pages/legal/legal.component').then(m => m.LegalComponent),
                title: 'Legal'
            },
            {
                path: 'trabaja-con-nosotros',
                loadComponent: () => import('./pages/empleo/empleo.component').then(m => m.EmpleoComponent),
                title: 'Trabaja con nosotros',
                data: { description: 'Únete al equipo de Mi Ternerita House. Mira los puestos abiertos y envía tu postulación.' }
            },
            {
                // Flujo de compra y perfil: requieren sesión
                path: '',
                canActivate: [AuthGuard],
                data: { noindex: true },
                children: [
                    {
                        path: 'home/event/:id/ticket',
                        loadComponent: () => import('./pages/ticket/ticket.component').then(m => m.TicketComponent),
                        title: 'Elige tus entradas'
                    },
                    {
                        // Próximo concierto: la misma página de entradas, con el mapa del salón
                        path: 'concierto',
                        loadComponent: () => import('./pages/ticket/ticket.component').then(m => m.TicketComponent),
                        title: 'Concierto'
                    },
                    {
                        path: 'home/event/:id/ticket/consume',
                        loadComponent: () => import('./pages/consume/consume.component').then(m => m.ConsumeComponent),
                        title: 'Consumo'
                    },
                    {
                        path: 'home/event/:id/ticket/checkout',
                        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
                        title: 'Confirma tus datos'
                    },
                    {
                        path: 'home/event/:id/ticket/checkout/payment',
                        loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
                        title: 'Pago'
                    },
                    {
                        path: 'home/profile',
                        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
                        title: 'Mi perfil'
                    }
                ]
            }
        ]
    },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard, AdminGuard],
        data: { noindex: true },
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard',
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
                path: 'reportes',
                loadComponent: () => import('./admin/reportes/reportes.component').then(m => m.ReportesComponent),
                title: 'Reportes'
            },
            {
                path: 'payments',
                loadComponent: () => import('./admin/payments/payments.component').then(m => m.PaymentsComponent),
                title: 'Pagos'
            },
            {
                path: 'postulaciones',
                loadComponent: () => import('./admin/postulaciones/postulaciones.component').then(m => m.PostulacionesComponent),
                title: 'Postulaciones'
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
            {
                path: 'clients',
                loadComponent: () => import('./admin/clients/clients.component').then(m => m.ClientsComponent),
                title: 'Clientes'
            },
        ]
    },
    { path: '**', redirectTo: '' }
];
