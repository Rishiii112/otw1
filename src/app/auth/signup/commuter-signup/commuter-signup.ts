import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-commuter-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commuter-signup.html',
  styleUrl: './commuter-signup.css'
})
export class CommuterSignup {

  name = signal('');
  email = signal('');
  password = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async register() {
  try {
    console.log("Creating commuter account...");

    const userData = {
      name: this.name(),
      email: this.email(),
      role: 'commuter',
      createdAt: new Date()
    };

    const userId = await this.authService.registerUser(
      this.email(),
      this.password(),
      userData
    );

    console.log("User created with ID:", userId);

    alert("Account created successfully!");
    this.router.navigate(['/login']);

  } catch (err: any) {
    console.error("SIGNUP ERROR:", err);
    alert("Error: " + err.message);
  }
}
}