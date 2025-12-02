import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  template: `<router-outlet></router-outlet>`
})
export class App {
  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      console.log('AUTH STATE (app root):', user ? user.uid : 'none');
    });
  }
}
