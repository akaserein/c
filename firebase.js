// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// YOUR PROVIDED CONFIG (kept same, storageBucket fixed)
const firebaseConfig = {
  apiKey: "AIzaSyBAOwLjCgopfBvkgXbTbCEKb7sU5VQ-JHU",
  authDomain: "boxi-cm.firebaseapp.com",
  databaseURL: "https://boxi-cm-default-rtdb.firebaseio.com",
  projectId: "boxi-cm",
  storageBucket: "boxi-cm.appspot.com",      // <- fixed
  messagingSenderId: "7208548687",
  appId: "1:7208548687:web:e38cdb5af7c7206f506d3a",
  measurementId: "G-BE6R2X39BS"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
