import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {

  constructor(
    private auth: Auth,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate: CanActivateFn = async (route, state) => {
    const expectedRole = route.data['role'];

    const user = await new Promise<any>((resolve) => {
      onAuthStateChanged(this.auth, u => resolve(u), () => resolve(null));
    });

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const role = await this.authService.getUserRole(user.uid);

    if (role === expectedRole) return true;

    this.router.navigate(['/login']);
    return false;
  };
}
