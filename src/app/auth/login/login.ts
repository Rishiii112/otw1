import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Auth } from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = signal('');
  password = signal('');
  error = signal('');

  constructor(
    private authService: AuthService,
    private auth: Auth,
    private router: Router
  ) {}

  // -------------------- EMAIL + PASSWORD LOGIN --------------------
  async login() {
    try {
      const userCredential = await this.authService.login(
        this.email(),
        this.password()
      );

      const user = userCredential.user;
      const role = await this.authService.getUserRole(user.uid);

      if (role === 'commuter') this.router.navigate(['/commuter/dashboard']);
      else if (role === 'driver') this.router.navigate(['/driver/dashboard']);
      else if (role === 'admin') this.router.navigate(['/admin/dashboard']);
      else this.error.set('Invalid role assigned.');
    } catch (err: any) {
      this.error.set(err.message || 'Login failed.');
    }
  }

  // -------------------- GOOGLE LOGIN --------------------
  async loginWithGoogle() {
    try {
      const { user, role } = await this.authService.loginWithGoogle();

      if (role === 'commuter') this.router.navigate(['/commuter/dashboard']);
      else if (role === 'driver') this.router.navigate(['/driver/dashboard']);
      else if (role === 'admin') this.router.navigate(['/admin/dashboard']);
      else {
        // If role is null/unknown, send user to signup/role-selection
        this.router.navigate(['/signup']);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Google login failed.');
    }
  }
}
