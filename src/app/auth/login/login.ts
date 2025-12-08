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

  // ---- ERROR MESSAGES ----
  private mapAuthErrorToMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-not-found':
        return 'No account was found with this email.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'The password you entered is incorrect.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in window was closed before finishing.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

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
      const code = err?.code || '';
      this.error.set(this.mapAuthErrorToMessage(code));
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
        this.router.navigate(['/signup']);
      }
    } catch (err: any) {
      const code = err?.code || '';
      this.error.set(this.mapAuthErrorToMessage(code));
    }
  }

  // -------------------- FORGOT PASSWORD --------------------
  async forgotPassword() {
    try {
      const value = this.email().trim();
      if (!value) {
        this.error.set('Please enter your email first.');
        return;
      }
      await this.authService.resetPassword(value);
      this.error.set('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      const code = err?.code || '';
      this.error.set(this.mapAuthErrorToMessage(code));
    }
  }
}
