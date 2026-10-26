import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDH_aA8l3esgr2uq-VaPjqV87ted5CZeuA",
  authDomain: "knowledge-vault-1eba0.firebaseapp.com",
  projectId: "knowledge-vault-1eba0",
  storageBucket: "knowledge-vault-1eba0.firebasestorage.app",
  messagingSenderId: "558807391554",
  appId: "1:558807391554:web:8146b0b176ba888fe07cdb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'knowledge-vault-app';
