import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC_Xl0bWw6sfrhijAI1DUKHr2zIEjScWSE",
  authDomain: "salesandoffers-s.firebaseapp.com",
  projectId: "salesandoffers-s",
  storageBucket: "salesandoffers-s.firebasestorage.app",
  messagingSenderId: "834246055175",
  appId: "1:834246055175:web:774fb56b62e65f373ea1a2",
  measurementId: "G-BKQJRE5SSR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const setupRecaptcha = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    callback: () => {},
    'expired-callback': () => {}
  });
};