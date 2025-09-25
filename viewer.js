// viewer.js - used by index.html & history.html
import { db } from "./firebase.js";
import {
  ref,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  query,
  orderByChild,
  limitToLast,
  runTransaction
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const feed = document.getElementById('feed');
const empty = document.getElementById('empty');

// if on index (latest) show last 6, if on history show all
const isHistory = location.pathname.includes('history.html');
const updatesRef = ref(db, 'updates');
const q = isHistory ? query(updatesRef, orderByChild('timestamp')) : query(updatesRef, orderByChild('timestamp'), limitToLast(6));

// Render helper
function createCard(key, data){
  const card = document.createElement('div');
  card.className = 'card fade-in';
  card.id = key;

  const text = data.text || '';
  // truncated paragraph with expand on click
  const p = document.createElement('p');
  p.textContent = text;
  p.title = text;
  p.addEventListener('click', ()=> {
    p.classList.toggle('expanded');
  });

  const imgHtml = data.imageURL ? `<img src="${data.imageURL}" alt="update image">` : '';

  const date = new Date(data.timestamp || Date.now());
  const dateStr = isNaN(date.getTime()) ? '' : date.toLocaleString();

  // meta row and like
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<div class="date">${dateStr}</div><div class="admin muted">${data.admin ? escapeHtml(data.admin) : ''}</div>`;

  const likeWrap = document.createElement('div');
  likeWrap.className = 'like-wrap';

  const likeBtn = document.createElement('button');
  likeBtn.className = 'like-btn';
  likeBtn.innerHTML = '❤';

  const likeCount = document.createElement('div');
  likeCount.className = 'like-count';
  likeCount.textContent = data.likes || 0;

  // create nodes
  card.appendChild(p);
  if(data.imageURL){
    const img = document.createElement('img');
    img.src = data.imageURL;
    img.loading = 'lazy';
    img.alt = 'update';
    card.appendChild(img);
  }
  card.appendChild(meta);

  likeWrap.appendChild(likeBtn);
  likeWrap.appendChild(likeCount);
  card.appendChild(likeWrap);

  // like logic - one like per device
  const localKey = 'boxi_liked_' + key;
  if(localStorage.getItem(localKey)){
    likeBtn.classList.add('liked');
  }

  likeBtn.addEventListener('click', async () => {
    if(localStorage.getItem(localKey)) return; // already liked on this device
    // optimistic UI
    likeBtn.classList.add('liked');
    likeCount.textContent = (parseInt(likeCount.textContent || '0') + 1);
    // safe increment using transaction
    const dbRef = ref(db, 'updates/' + key + '/likes');
    try {
      await runTransaction(dbRef, (current) => {
        return (current || 0) + 1;
      });
      localStorage.setItem(localKey, '1');
      likeBtn.classList.add('pop');
      setTimeout(()=> likeBtn.classList.remove('pop'), 350);
    } catch (e) {
      console.error('Like failed', e);
    }
  });

  // show newest on top
  if(isHistory){
    feed.appendChild(card); // history chronological
  } else {
    feed.prepend(card); // latest at top
  }
}

// sanitize
function escapeHtml(s){
  return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// wire realtime listeners (for the chosen query we use onChildAdded/Changed/Removed)
onChildAdded(q, snap => {
  empty.style.display = 'none';
  createCard(snap.key, snap.val());
});
onChildChanged(q, snap => {
  const el = document.getElementById(snap.key);
  if(el) el.remove();
  createCard(snap.key, snap.val());
});
onChildRemoved(q, snap => {
  const el = document.getElementById(snap.key);
  if(el) el?.remove();
});

// initial empty check - ensure empty placeholder toggles
import { get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
get(query(updatesRef, orderByChild('timestamp'))).then(snap=>{
  if(!snap.exists()){
    empty.style.display = 'block';
  }
});
