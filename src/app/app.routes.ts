import { Routes } from '@angular/router';

// AUTH COMPONENTS
import { Login } from './auth/login/login';
import { SignupChoice } from './auth/signup/signup-choice/signup-choice';
import { CommuterSignup } from './auth/signup/commuter-signup/commuter-signup';
import { AdminSetup } from './auth/signup/admin-setup/admin-setup';

// DASHBOARD COMPONENTS
import { Commuter } from './dashboards/commuter/commuter';
import { Driver } from './dashboards/driver/driver';
import { Admin } from './dashboards/admin/admin';
import { AddDriver } from './dashboards/admin/add-driver/add-driver';

// GUARD
import { RoleGuard } from './services/role-guard';

export const routes: Routes = [

  // ---------- AUTH ----------
  { path: 'login', component: Login },

  {
    path: 'signup',
    children: [
      { path: '', component: SignupChoice },
      { path: 'commuter', component: CommuterSignup },
      { path: 'admin', component: AdminSetup }
    ]
  },

  // ---------- DASHBOARDS ----------
  {
    path: 'commuter/dashboard',
    component: Commuter,
    canActivate: [RoleGuard],
    data: { role: 'commuter' }
  },

  {
    path: 'driver/dashboard',
    component: Driver,
    canActivate: [RoleGuard],
    data: { role: 'driver' }
  },

  {
    path: 'admin/dashboard',
    component: Admin,
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },

  {
    path: 'admin/dashboard/add-driver',
    component: AddDriver,
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },

  // ---------- DEFAULT ----------
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ---------- 404 ----------
  { path: '**', redirectTo: 'login' }
];