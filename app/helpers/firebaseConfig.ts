import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCqsd1VawimgTDL56sPFUcOik6RPNup42M",
  authDomain: "manager-e825a.firebaseapp.com",
  databaseURL: "https://manager-e825a.firebaseio.com",
  projectId: "manager-e825a",
  storageBucket: "manager-e825a.appspot.com",
  messagingSenderId: "966714417198",
  appId: "1:966714417198:android:74483baf86c82c837c7fbf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { db, auth };
