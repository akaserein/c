// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkrJywdCAhPm8VbV3Ji0Ktkdc4m2UIj1Y",
  authDomain: "chatmark-u.firebaseapp.com",
  databaseURL: "https://chatmark-u-default-rtdb.firebaseio.com/",
  projectId: "chatmark-u",
  storageBucket: "chatmark-u.appspot.com",
  messagingSenderId: "682637917512",
  appId: "1:682637917512:web:ea41aaa8e9af4bdf490770",
  measurementId: "G-H941JPNK3D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();

// Bad words filter
const bannedWords = ["gali1","gali2","ganda"];

// Track current user
let currentUser = null;

// Google Login
document.getElementById("googleBtn").addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then(result => { currentUser = result.user; updateStatus(); })
    .catch(err => alert(err.message));
});

// Email login or register
function loginWithEmail() {
  const email = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if(!email || !pass) return alert("Enter credentials");

  auth.signInWithEmailAndPassword(email, pass)
    .then(userCred => { currentUser = userCred.user; updateStatus(); })
    .catch(err => {
      // Register if not found
      auth.createUserWithEmailAndPassword(email, pass)
        .then(userCred => { currentUser = userCred.user; updateStatus(); })
        .catch(error => alert(error.message));
    });
}

// Logout
function logout() {
  auth.signOut().then(() => { currentUser=null; updateStatus(); });
}

// Update user status
function updateStatus() {
  document.getElementById("userStatus").textContent = currentUser 
    ? `Logged in as: ${currentUser.displayName || currentUser.email}` 
    : "Not logged in";
}

// Post comment
function postComment() {
  if(!currentUser) return alert("Login first");
  let comment = document.getElementById("commentBox").value.toLowerCase();
  for(let word of bannedWords) if(comment.includes(word)) return alert("Inappropriate word!");
  
  db.ref('comments/').push({
    text: comment,
    user: currentUser.displayName || currentUser.email,
    timestamp: Date.now()
  });
  document.getElementById("commentBox").value = "";
}

// Display comments
db.ref('comments/').on('value', snapshot => {
  const commentsDiv = document.getElementById("commentsList");
  commentsDiv.innerHTML = "";
  snapshot.forEach(childSnap => {
    const data = childSnap.val();
    const p = document.createElement("p");
    p.textContent = `${data.user}: ${data.text}`;
    commentsDiv.appendChild(p);
  });
});

// Auth state change
auth.onAuthStateChanged(user => { currentUser = user; updateStatus(); });
