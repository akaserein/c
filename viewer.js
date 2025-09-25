import { db } from "./firebase-config.js";
import { ref, onChildAdded, onChildChanged, onChildRemoved, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const updatesRef = ref(db, "updates");
const updatesDiv = document.getElementById("updates");

function renderUpdate(key, data) {
  let existing = document.getElementById(key);
  if (existing) existing.remove();

  const card = document.createElement("div");
  card.className = "card animate-in";
  card.id = key;

  card.innerHTML = `
    <p>${data.text || ""}</p>
    ${data.image ? `<img src="${data.image}" alt="update">` : ""}
    <small>${new Date(data.timestamp).toLocaleString()}</small>
    <div class="like-section">
      <button class="like-btn" data-id="${key}">❤️</button>
      <span id="like-count-${key}">${data.likes || 0}</span>
    </div>
  `;

  card.querySelector(".like-btn").onclick = () => {
    const newLikes = (data.likes || 0) + 1;
    update(ref(db, "updates/" + key), { likes: newLikes });
  };

  updatesDiv.prepend(card);

  setTimeout(() => card.classList.remove("animate-in"), 500);
}

onChildAdded(updatesRef, (snap) => renderUpdate(snap.key, snap.val()));
onChildChanged(updatesRef, (snap) => renderUpdate(snap.key, snap.val()));
onChildRemoved(updatesRef, (snap) => {
  const el = document.getElementById(snap.key);
  if (el) el.remove();
});
