import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './core/layout/layout.component';

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
            loadComponent: () => import('./core/auth/login/login.component').then(m => m.LoginComponent),
            title: 'Login'
        },
        {
            path: 'register',
            loadComponent: () => import('./core/auth/register/register.component').then(m => m.RegisterComponent),
            title: 'Register'
        },
        {
            path: 'home/event',
            loadComponent: () => import('./pages/event/event.component').then(m => m.EventComponent),
            title: 'Event'
        }
    ]
}

];

