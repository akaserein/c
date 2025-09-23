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
const db = firebase.database();

// Bad words filter
const bannedWords = ["gali1","gali2","ganda"];

// Generate random username
function randomName() {
  const names = ["Sky","Blue","Star","Moon","Pixel","Wave","Leaf","Cloud","Echo","Nova"];
  return names[Math.floor(Math.random()*names.length)] + Math.floor(Math.random()*1000);
}

// Post comment
function postComment() {
  let comment = document.getElementById("commentBox").value.trim();
  if(!comment) return;

  // Check bad words
  for(let word of bannedWords) if(comment.toLowerCase().includes(word)) {
    alert("Inappropriate word!");
    return;
  }

  const user = randomName();
  db.ref('comments/').push({
    text: comment,
    user: user,
    timestamp: Date.now()
  });

  document.getElementById("commentBox").value = "";
}

// Display comments with iPhone style animation
db.ref('comments/').on('value', snapshot => {
  const commentsDiv = document.getElementById("commentsList");
  commentsDiv.innerHTML = "";
  snapshot.forEach(childSnap => {
    const data = childSnap.val();
    const p = document.createElement("div");
    p.className = "comment user";
    p.textContent = `${data.user}: ${data.text}`;
    commentsDiv.appendChild(p);
    // Scroll to bottom
    commentsDiv.scrollTop = commentsDiv.scrollHeight;
  });
});
