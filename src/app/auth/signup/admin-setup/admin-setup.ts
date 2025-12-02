import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [FormsModule], // ✅ Add FormsModule here
  templateUrl: './admin-setup.html',
  styleUrls: ['./admin-setup.css']
})
export class AdminSetup {

  email = '';
  password = '';
  loading = false;
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  async createAdmin() {
    this.loading = true;
    this.message = '';

    try {
      const adminData = {
        role: 'admin',
        email: this.email,
        createdAt: new Date()
      };

      await this.authService.registerUser(this.email, this.password, adminData);

      this.message = 'Admin account created successfully! Redirecting...';

      setTimeout(() => {
        this.router.navigate(['/admin/dashboard']);
      }, 1500);

    } catch (error: any) {
      this.message = error.message;
    }

    this.loading = false;
  }
}