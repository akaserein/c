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

// Random name generator
function randomName() {
  const names = ["Sky","Blue","Star","Moon","Pixel","Wave","Leaf","Cloud","Echo","Nova"];
  return names[Math.floor(Math.random()*names.length)] + Math.floor(Math.random()*1000);
}

// Post comment
function postComment(parentId=null) {
  let commentText = document.getElementById("commentBox").value.trim();
  if(!commentText) return;

  for(let word of bannedWords) if(commentText.toLowerCase().includes(word)) {
    alert("Inappropriate word!");
    return;
  }

  const user = randomName();

  db.ref('comments/').push({
    text: commentText,
    user: user,
    timestamp: Date.now(),
    parent: parentId || null,
    likes: 0,
    dislikes: 0
  });

  document.getElementById("commentBox").value = "";
}

// Display comments
db.ref('comments/').on('value', snapshot => {
  const commentsDiv = document.getElementById("commentsList");
  commentsDiv.innerHTML = "";
  
  const comments = [];
  snapshot.forEach(childSnap => {
    const data = childSnap.val();
    comments.push({...data, id: childSnap.key});
  });

  // Show top-level comments first
  comments.filter(c => !c.parent).forEach(c => {
    const div = createCommentDiv(c, comments);
    commentsDiv.appendChild(div);
  });

  commentsDiv.scrollTop = commentsDiv.scrollHeight;
});

// Create comment div with reply + like/dislike
function createCommentDiv(comment, allComments) {
  const div = document.createElement("div");
  div.className = "comment user";
  div.innerHTML = `<strong>${comment.user}:</strong> ${comment.text}`;

  // Actions
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.innerHTML = `
    <span onclick="likeComment('${comment.id}',1)">👍 ${comment.likes}</span>
    <span onclick="likeComment('${comment.id}',-1)">👎 ${comment.dislikes}</span>
    <span onclick="showReplyInput('${comment.id}')">Reply</span>
  `;
  div.appendChild(actions);

  // Replies
  allComments.filter(c => c.parent === comment.id).forEach(reply => {
    const replyDiv = createCommentDiv(reply, allComments);
    replyDiv.style.marginLeft = "20px";
    div.appendChild(replyDiv);
  });

  return div;
}

// Like/Dislike
function likeComment(id, type) {
  const ref = db.ref('comments/' + id);
  ref.get().then(snap => {
    if(!snap.exists()) return;
    const data = snap.val();
    if(type===1) data.likes++;
    else data.dislikes++;
    ref.update({likes:data.likes, dislikes:data.dislikes});
  });
}

// Reply input
function showReplyInput(id) {
  const replyBox = document.createElement("div");
  replyBox.className = "reply-input";
  replyBox.innerHTML = `<input type="text" placeholder="Reply...">
                        <button>Send</button>`;
  replyBox.querySelector("button").addEventListener("click", () => {
    const text = replyBox.querySelector("input").value.trim();
    if(!text) return;
    const user = randomName();
    db.ref('comments/').push({
      text: text,
      user: user,
      timestamp: Date.now(),
      parent: id,
      likes: 0,
      dislikes: 0
    });
    replyBox.remove();
  });

  const commentsDiv = document.getElementById("commentsList");
  const parentDiv = Array.from(commentsDiv.querySelectorAll(".comment")).find(d => d.innerHTML.includes(id)) || commentsDiv.lastChild;
  parentDiv.appendChild(replyBox);
}
