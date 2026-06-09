import { initializeApp, getApps } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

function mapFirebaseUser(user) {
  if (!user) return null;

  return {
    provider: 'google',
    uid: user.uid,
    name: user.displayName || 'Google Student',
    email: user.email || '',
    picture: user.photoURL || '',
    signedInAt: new Date().toISOString()
  };
}

function getFirebaseAuth() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase auth is not configured.');
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getAuth(app);
}

export function subscribeToFirebaseAuth(callback) {
  if (!isFirebaseConfigured) return () => {};

  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (user) => {
    callback(mapFirebaseUser(user));
  });
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  return mapFirebaseUser(result.user);
}

export async function signOutGoogle() {
  if (!isFirebaseConfigured) return;
  await signOut(getFirebaseAuth());
}
