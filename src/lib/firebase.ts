// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: 'kpi-central-1kjf8',
  appId: '1:852984596237:web:b47d9c1694189fe1319244',
  storageBucket: 'kpi-central-1kjf8.firebasestorage.app',
  apiKey: 'AIzaSyAaw3qMdPZD-C2qH9Ik-nTwNKVp-4x0scs',
  authDomain: 'kpi-central-1kjf8.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '852984596237',
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
