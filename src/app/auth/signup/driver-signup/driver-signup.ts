/* import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-driver-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-signup.html'
})
export class DriverSignup {

  // Signals
  name = signal('');
  email = signal('');
  password = signal('');
  license = signal('');
  plate = signal('');
  submitted = false;

  authService = inject(AuthService);
  router = inject(Router);

  async register() {
    this.submitted = true;

    // Basic validation
    if (!this.name() || !this.email() || !this.password() || !this.license() || !this.plate()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const userData = {
        name: this.name(),
        email: this.email(),
        role: 'driver',
        license: this.license(),
        plate: this.plate(),
        status: 'pending',
        isActive: false,
        createdAt: new Date()
      };

      await this.authService.registerUser(this.email(), this.password(), userData);

      alert('Driver account created! Waiting for admin approval.');
      this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Driver Signup Error:', error);
      alert('Error creating account: ' + error.message);
    }
  }
}

 */