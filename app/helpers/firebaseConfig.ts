import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAyUySmW5SuCnf3mWVb7cArUhjX8ZeoZcw',
  authDomain: 'auto-guide-2.firebaseapp.com',
  projectId: 'auto-guide-2',
  storageBucket: 'auto-guide-2.appspot.com',
  messagingSenderId: '324873906598',
  appId: '1:324873906598:android:cc2f92ffe350faa18bc767',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { db, auth };
