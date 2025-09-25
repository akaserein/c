// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Tumhara diya hua config (sirf storageBucket fix karke)
const firebaseConfig = {
  apiKey: "AIzaSyBAOwLjCgopfBvkgXbTbCEKb7sU5VQ-JHU",
  authDomain: "boxi-cm.firebaseapp.com",
  databaseURL: "https://boxi-cm-default-rtdb.firebaseio.com",
  projectId: "boxi-cm",
  storageBucket: "boxi-cm.appspot.com", // <- fix kiya
  messagingSenderId: "7208548687",
  appId: "1:7208548687:web:e38cdb5af7c7206f506d3a",
  measurementId: "G-BE6R2X39BS"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

export { db, storage };
