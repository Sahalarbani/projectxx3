import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// PENTING: Ganti konfigurasi di bawah ini dengan konfigurasi dari Firebase Console Anda
const firebaseConfig = {
  apiKey: "ISI_API_KEY_ANDA_DISINI",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
