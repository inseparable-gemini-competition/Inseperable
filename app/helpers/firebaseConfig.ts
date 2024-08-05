import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';  // Add this import

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
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const functions = getFunctions(app);
const storage = getStorage(app);  // Initialize Firebase Storage

export { db, auth, functions, storage };  // Export storage along with other services