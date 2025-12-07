import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc
} from '@angular/fire/firestore';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {

  // -------------------------
  // CREATE DRIVER
  // -------------------------
  newDriverName = '';
  newDriverEmail = '';
  newDriverLicense = '';
  newDriverPlate = '';
  userMenuOpen = false;
  // -------------------------
  // COMMUTER EDIT
  // -------------------------
  editId = '';
  editCommuterName = '';
  editCommuterEmail = '';

  // -------------------------
  // DRIVER EDIT
  // -------------------------
  editDriverId = '';
  editDriverName = '';
  editDriverEmail = '';
  editDriverLicense = '';
  editDriverPlate = '';

  // -------------------------
  // SIGNALS
  // -------------------------
  commuters = signal<any[]>([]);
  drivers = signal<any[]>([]);

  // -------------------------
  // UI STATE (which section)
  // -------------------------
  activeSection: 'drivers' | 'commuters' = 'drivers';

  constructor(
    private firestore: Firestore,
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadDrivers();
    await this.loadCommuters();
  }

  // toggle sidebar buttons
  showDrivers() {
    this.activeSection = 'drivers';
  }

  showCommuters() {
    this.activeSection = 'commuters';
  }

  // ==============================
  // LOAD COMMUTERS
  // ==============================
  async loadCommuters() {
    const usersRef = collection(this.firestore, 'users');
    const commuterQuery = query(usersRef, where('role', '==', 'commuter'));
    const snap = await getDocs(commuterQuery);
    this.commuters.set(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  // ==============================
  // LOAD DRIVERS
  // ==============================
  async loadDrivers() {
    const usersRef = collection(this.firestore, 'users');
    const driverQuery = query(usersRef, where('role', '==', 'driver'));
    const snap = await getDocs(driverQuery);
    this.drivers.set(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  // ==============================
  // COMMUTER FUNCTIONS
  // ==============================
  startEdit(c: any) {
    this.editId = c.id;
    this.editCommuterName = c.name;
    this.editCommuterEmail = c.email;
  }

  cancelEdit() {
    this.editId = '';
  }

  async updateUser(id: string, data: any) {
    const ref = doc(this.firestore, 'users', id);
    await updateDoc(ref, data);
    alert('Commuter updated.');
    this.cancelEdit();
    await this.loadCommuters();
  }

  async deleteCommuter(id: string) {
    const ref = doc(this.firestore, 'users', id);
    await deleteDoc(ref);
    alert('Commuter deleted.');
    await this.loadCommuters();
  }

  // ==============================
  // DRIVER FUNCTIONS
  // ==============================
  startDriverEdit(d: any) {
    this.editDriverId = d.id;
    this.editDriverName = d.name;
    this.editDriverEmail = d.email;
    this.editDriverLicense = d.license ?? '';
    this.editDriverPlate = d.plate ?? '';
  }

  cancelDriverEdit() {
    this.editDriverId = '';
  }

  async updateDriver(id: string, data: any) {
    const ref = doc(this.firestore, 'users', id);
    await updateDoc(ref, data);
    alert('Driver updated.');
    this.cancelDriverEdit();
    await this.loadDrivers();
  }

  async deleteDriverAccount(id: string) {
    const ref = doc(this.firestore, 'users', id);
    await deleteDoc(ref);
    alert('Driver deleted.');
    await this.loadDrivers();
  }

  // ==============================
  // CREATE DRIVER
  // ==============================
  async createDriver() {
    if (!this.newDriverName || !this.newDriverEmail) {
      alert('Name and email are required.');
      return;
    }

    const usersRef = collection(this.firestore, 'users');

    const driverData = {
      name: this.newDriverName,
      email: this.newDriverEmail,
      license: this.newDriverLicense,
      plate: this.newDriverPlate,
      role: 'driver',
      status: 'approved',
      createdAt: new Date()
    };

    await addDoc(usersRef, driverData);
    alert('Driver account created.');

    this.newDriverName = '';
    this.newDriverEmail = '';
    this.newDriverLicense = '';
    this.newDriverPlate = '';

    await this.loadDrivers();
  }

  // ==============================
  // LOGOUT
  // ==============================
  logout() {
    signOut(this.auth).then(() => {
      alert('Logged out successfully!');
      window.location.href = '/';
    });
  }
}
