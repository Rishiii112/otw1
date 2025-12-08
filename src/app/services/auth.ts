import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
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

  //RESET PASS
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email); 
  }

  // -------------------- LOGIN (EMAIL + PASSWORD, with persistence) --------------------
  async login(email: string, password: string) {
    await setPersistence(this.auth, browserLocalPersistence);
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // -------------------- LOGIN WITH GOOGLE --------------------
  async loginWithGoogle(): Promise<{ user: any; role: string | null; isNew: boolean }> {
    await setPersistence(this.auth, browserLocalPersistence);

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider); 
    const user = result.user;

    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);

    // If first login, create a basic user document.
    if (!snap.exists()) {
      const defaultRole = 'commuter';

      await setDoc(userRef, {
        email: user.email,
        role: defaultRole,
        createdAt: new Date()
      });

      return { user, role: defaultRole, isNew: true };
    }

    const data = snap.data() as any;
    const role = (data.role as string) || null;

    return { user, role, isNew: false };
  }

  // -------------------- GET USER ROLE --------------------
  async getUserRole(userId: string): Promise<string | null> {
    const ref = doc(this.firestore, 'users', userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data()['role'] as string;
  }
}
