import { initializeApp } from 'firebase/app';
const firebaseConfig = {
    apiKey: "AIzaSyBEafjtqRxBn3UxcXiVwTC0TkbocQEvwMY",
    authDomain: "auth-test-6f600.firebaseapp.com",
    projectId: "auth-test-6f600",
    storageBucket: "auth-test-6f600.appspot.com",
    messagingSenderId: "657486991476",
    appId: "1:657486991476:web:ed685434bd4b93f4548121"
};
  
const fireapp = initializeApp(firebaseConfig);
export {fireapp};