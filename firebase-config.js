import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDH0JUvXVHEHFuQpemNGU2g-Q7lNF-c4pA",
  authDomain: "watches-wala.firebaseapp.com",
  projectId: "watches-wala",
  storageBucket: "watches-wala.firebasestorage.app",
  messagingSenderId: "600719533688",
  appId: "1:600719533688:web:96039f44afb6497b112f8d"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
