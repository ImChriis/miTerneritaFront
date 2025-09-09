import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
    {
    path: '',
    component: LayoutComponent,
    pathMatch: 'full',
    children: [
        {
            path: '',
            loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
            title: 'Home'
        }
    ]
}

];

