import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  constructor() {}

  // -------------------- SIGN UP (GENERAL) --------------------
  async registerUser(email: string, password: string, data: any) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const userId = userCredential.user.uid;

    await setDoc(doc(this.firestore, 'users', userId), data);
    return userId;
  }

  // -------------------- LOGIN (with persistence) --------------------
  async login(email: string, password: string) {
    await setPersistence(this.auth, browserLocalPersistence); // persists across reloads
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // -------------------- GET USER ROLE --------------------
  async getUserRole(userId: string): Promise<string | null> {
    const ref = doc(this.firestore, 'users', userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data()['role'] as string;
  }
}
