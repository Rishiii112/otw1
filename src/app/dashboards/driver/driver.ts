import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  addDoc,
  collectionData,
  query,
  orderBy
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver.html',
  styleUrls: ['./driver.css']
})
export class Driver implements OnDestroy {

  isOnline = false;
  intervalId: any = null;
  driverId: string | null = null;
  driverName: string | null = null;
  customUsername = '';
  showSettings = false;
  plate: string | null = null;

  lastLat: number | null = null;
  lastLng: number | null = null;
  lastTimestamp: number | null = null;

  routeId: string = 'Aurora Hill';


// logout
// Add in your Driver class
dropdownOpen = false;
driverCommunityOpen = false;
passengerCount = 0; 
capacity: number | null = null; // <-- add this


toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

closeDropdown() {
  this.dropdownOpen = false;
}

toggleDriverCommunity() {
  this.driverCommunityOpen = !this.driverCommunityOpen;
}

incrementPassengers() {
  // If capacity is set, prevent exceeding it
  if (this.capacity !== null && this.passengerCount >= this.capacity) return;
  this.passengerCount = this.passengerCount + 1;
}

emptyPassengers() {
  this.passengerCount = 0;
}

logout() {
  // stop interval and remove jeep doc
  this.setDriverOffline();   // reuses your existing logic

  this.auth.signOut().then(() => {
    window.location.href = '/otw1/#/login';
  });
}



  // driver-only community
  driverNewPostText = '';
  driverCommunityPosts: any[] = [];
  private driverCommunitySub: Subscription | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.driverId = user.uid;
        const baseName = user.displayName || user.email || 'Driver';
        const saved = localStorage.getItem('driverCustomUsername');

        this.driverName = saved || baseName;
        this.customUsername = this.driverName;

        // read extra fields from users/{uid}
        const ref = doc(this.firestore, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data: any = snap.data();
          this.plate = data.plate || null;
          this.capacity = data.capacity || null;
        }

        console.log('loaded plate:', this.plate);
      } else {
        this.driverId = null;
        this.driverName = null;
        this.customUsername = '';
        this.plate = null;
      }
    });

    this.loadDriverCommunity();
  }

  ngOnDestroy() {
    this.driverCommunitySub?.unsubscribe();
  }

  // ===== location sharing =====
  startLocationUpdates() {
    this.intervalId = setInterval(() => this.sendLocationOnce(), 2000);
    this.sendLocationOnce();
  }

  private async sendLocationOnce() {
    if (!navigator.geolocation || !this.driverId) return;

    const driverId = this.driverId;
    const driverName = this.driverName || 'Driver';

navigator.geolocation.getCurrentPosition(
  async position => {
    const { latitude, longitude } = position.coords;
    const now = Date.now();

    let computedSpeed = 0;

    if (this.lastLat !== null && this.lastLng !== null && this.lastTimestamp !== null) {
      const dt = (now - this.lastTimestamp) / 1000;
      const dist = this.haversine(this.lastLat, this.lastLng, latitude, longitude);
      computedSpeed = dist / dt;
    }

    this.lastLat = latitude;
    this.lastLng = longitude;
    this.lastTimestamp = now;

    await setDoc(
      doc(this.firestore, 'jeepneys', driverId),
      {
        id: driverId,
        plate: this.plate || 'unknown',
        driverName: driverName,
        lat: latitude,
        lng: longitude,
        updatedAt: now,
        speed: computedSpeed,
        routeId: this.routeId,
        passengerCount: this.passengerCount,
        capacity: this.capacity
      },
      { merge: true }
    );
  },
  error => {
    console.error('Geolocation error', error);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 0,   
    timeout: 10000
    }
      );
  }

  async setDriverOnline() {
    if (!this.driverId) return alert('Driver not logged in.');
    this.isOnline = true;
    this.startLocationUpdates();
  }

  async setDriverOffline() {
    if (!this.driverId) return;
    this.isOnline = false;

    if (this.intervalId) clearInterval(this.intervalId);

    const driverId = this.driverId;
    await deleteDoc(doc(this.firestore, 'jeepneys', driverId));
  }

  toggleOnline() {
    this.isOnline ? this.setDriverOffline() : this.setDriverOnline();
  }

// ===== Settings modal actions =====
openSettings() {
  this.closeDropdown();
  this.showSettings = true;
}

closeSettings() {
  this.showSettings = false;
}

saveUsername() {
  const name = (this.customUsername || '').trim();
  if (!name) return alert('Username cannot be empty.');

  this.driverName = name;
  localStorage.setItem('driverCustomUsername', name);

  alert('Username updated!');
}

  // ===== driver-only community chat =====
  private loadDriverCommunity() {
    const colRef = collection(this.firestore, 'driverCommunity');
    const q = query(colRef, orderBy('time', 'desc'));

    this.driverCommunitySub = collectionData(q, { idField: 'id' })
      .subscribe((posts: any[]) => {
        this.driverCommunityPosts = (posts || []).map(p => ({
          ...p,
          timeDisplay: p.time ? new Date(p.time).toLocaleString() : ''
        }));
      });
  }

  async sendDriverPost() {
    const text = (this.driverNewPostText || '').trim();
    if (!text) return;

    const postsRef = collection(this.firestore, 'driverCommunity');
    await addDoc(postsRef, {
      user: this.driverName || this.plate || 'Driver',
      text,
      role: 'driver',
      time: new Date().toISOString()
    });

    this.driverNewPostText = '';
  }

  // ===== distance helper =====
  haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const toRad = (x: number) => x * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    return R * 2 * Math.asin(
      Math.sqrt(
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2
      )
    );
  }
}