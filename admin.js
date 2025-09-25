import { db, storage } from "./firebase-config.js";
import { ref, push, set, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const updatesRef = ref(db, "updates");
const form = document.getElementById("updateForm");
const adminUpdates = document.getElementById("adminUpdates");

const adminUser = localStorage.getItem("admin");
if (!adminUser) window.location.href = "login.html";

form.onsubmit = async (e) => {
  e.preventDefault();
  const text = document.getElementById("text").value;
  const file = document.getElementById("image").files[0];

  let imageUrl = "";
  if (file) {
    const storageRef = sRef(storage, "updates/" + Date.now() + "-" + file.name);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  const newRef = push(updatesRef);
  set(newRef, {
    text,
    image: imageUrl,
    timestamp: Date.now(),
    admin: adminUser,
    likes: 0
  });

  form.reset();
};

onChildAdded(updatesRef, (snap) => {
  const data = snap.val();
  const card = document.createElement("div");
  card.className = "card animate-in";
  card.id = snap.key;

  card.innerHTML = `
    <p>${data.text || ""}</p>
    ${data.image ? `<img src="${data.image}">` : ""}
    <small>${new Date(data.timestamp).toLocaleString()} — ${data.admin}</small>
    <button class="delete-btn">🗑 Delete</button>
  `;

  card.querySelector(".delete-btn").onclick = () => {
    if (confirm("Delete this update?")) {
      remove(ref(db, "updates/" + snap.key));
    }
  };

  adminUpdates.prepend(card);
  setTimeout(() => card.classList.remove("animate-in"), 500);
});
