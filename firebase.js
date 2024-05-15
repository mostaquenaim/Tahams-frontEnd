import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA0Rmj1MbSnhI1zujsHcYqIau8y0QNraTU",
  authDomain: "tahams-bd.firebaseapp.com",
  projectId: "tahams-bd",
  storageBucket: "tahams-bd.appspot.com",
  messagingSenderId: "874901491519",
  appId: "1:874901491519:web:96ce72a6d34077372ccd8a"
};

let app;

try {
  app = getApp(); // Try to get the existing app
} catch (e) {
  // If the app doesn't exist, initialize it
  app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
