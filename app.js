// App.js (ES module)
// Frontend-first demo. This file saves reviews to localStorage by default so it works on GitHub Pages.
// To use MongoDB, build a small server (Express) and call its API endpoints from the `fetch` calls below.

const FRONTEND_ONLY = true; // set to false when you have backend endpoints ready

const STORAGE_KEY = 'iphone_reviews_demo_v1';

// DOM refs
const postBtn = document.getElementById('post-btn');
const reviewsContainer = document.getElementById('reviews');
const reviewInput = document.getElementById('review-input');
const imageUrlInput = document.getElementById('image-url');
const btnProfile = document.getElementById('btn-profile');
const loginModal = document.getElementById('login-modal');
const loginSubmit = document.getElementById('login-submit');
const loginCancel = document.getElementById('login-cancel');
const usernameField = document.getElementById('username');
const passwordField = document.getElementById('password');

// Simple auth (demo): store username in localStorage
function currentUser(){
  return JSON.parse(localStorage.getItem('demo_user') || 'null');
}

function setUser(u){
  localStorage.setItem('demo_user', JSON.stringify(u));
  updateProfileBtn();
}

function updateProfileBtn(){
  const u = currentUser();
  btnProfile.textContent = u ? u.username : 'Log in';
}

btnProfile.addEventListener('click', ()=>{
  loginModal.classList.remove('hidden');
});

loginCancel.addEventListener('click', ()=>loginModal.classList.add('hidden'));

loginSubmit.addEventListener('click', ()=>{
  const username = usernameField.value.trim();
  const password = passwordField.value;
  if(!username || !password){
    alert('Enter username and password');
    return;
  }

  // Demo: just save username & password locally (NOT recommended for production)
  // In production: send to your server which will save hashed password and create a session/jwt.
  setUser({username});
  loginModal.classList.add('hidden');
});

// Data helpers
function loadReviews(){
  if(FRONTEND_ONLY){
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } else {
    // Replace with: return fetch('/api/reviews').then(r=>r.json());
    return [];
  }
}

function saveReviews(data){
  if(FRONTEND_ONLY){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return Promise.resolve();
  } else {
    // POST to your server: fetch('/api/reviews', {method:'POST', body: JSON.stringify(data)})
    return Promise.resolve();
  }
}

function timeNow(){
  return new Date().toLocaleString();
}

function render(){
  const items = loadReviews();
  reviewsContainer.innerHTML = '';
  items.slice().reverse().forEach(item=>{
    const el = document.createElement('div');
    el.className = 'review';

    el.innerHTML = `
      <div class="avatar">${escapeHTML(initials(item.username))}</div>
      <div class="review-body">
        <div class="meta"><div class="user">${escapeHTML(item.username)}</div><div class="time">${escapeHTML(item.time)}</div></div>
        <div class="content-text">${escapeHTML(item.text)}</div>
        ${item.image ? `<img class="review-img" src="${escapeHTML(item.image)}" onerror="this.style.display='none'"/>` : ''}
        <div class="actions">
          <button class="small-btn like-btn">👍 <span>${item.likes||0}</span></button>
          <button class="small-btn dislike-btn">👎 <span>${item.dislikes||0}</span></button>
          <button class="small-btn reply-toggle">Reply</button>
        </div>
        <div class="reply-area" style="display:none;margin-top:8px">
          <input class="reply-input" placeholder="Write a reply..." />
          <button class="small-btn reply-send">Send</button>
          <div class="reply-list">
            ${(item.replies||[]).map(r=>`<div class="reply"><strong>${escapeHTML(r.username)}</strong> · <span class="time">${escapeHTML(r.time)}</span><div>${escapeHTML(r.text)}</div></div>`).join('')}
          </div>
        </div>
      </div>
    `;

    // attach behavior
    const likeBtn = el.querySelector('.like-btn');
    const dislikeBtn = el.querySelector('.dislike-btn');
    const replyToggle = el.querySelector('.reply-toggle');
    const replyArea = el.querySelector('.reply-area');
    const replySend = el.querySelector('.reply-send');
    const replyInput = el.querySelector('.reply-input');

    likeBtn.addEventListener('click', ()=>{
      item.likes = (item.likes||0)+1;
      saveAllAndRerender(items);
    });
    dislikeBtn.addEventListener('click', ()=>{
      item.dislikes = (item.dislikes||0)+1;
      saveAllAndRerender(items);
    });
    replyToggle.addEventListener('click', ()=>{
      replyArea.style.display = replyArea.style.display === 'none' ? 'block' : 'none';
    });
    replySend.addEventListener('click', ()=>{
      const user = currentUser();
      if(!user){ alert('Please login to reply'); return; }
      const text = replyInput.value.trim();
      if(!text) return;
      item.replies = item.replies || [];
      item.replies.push({username: user.username, text, time: timeNow()});
      replyInput.value = '';
      saveAllAndRerender(items);
    });

    reviewsContainer.appendChild(el);
  });
}

function saveAllAndRerender(items){
  saveReviews(items).then(()=>render());
}

postBtn.addEventListener('click', ()=>{
  const user = currentUser();
  if(!user){ alert('Please login to post'); return; }
  const text = reviewInput.value.trim();
  const img = imageUrlInput.value.trim();
  if(!text && !img){ alert('Write something or add an image'); return; }

  const items = loadReviews();
  items.push({
    id: Date.now(),
    username: user.username,
    text,
    image: img || null,
    time: timeNow(),
    likes:0,dislikes:0,replies:[]
  });
  reviewInput.value = ''; imageUrlInput.value = '';
  saveAllAndRerender(items);
});

function initials(name){
  return (name||'U').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
}

function escapeHTML(s){
  if(!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// init sample data on first load
if(!localStorage.getItem(STORAGE_KEY)){
  const sample = [{id:1,username:'Admin',text:'Welcome to the review wall! Add your thoughts.',image:null,time:timeNow(),likes:2,dislikes:0,replies:[] }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
}

updateProfileBtn();
render();

// --- Backend notes (server-side, NOT in browser) ---
// Example Express endpoints you can create on your server (use your MongoDB URI there):
// POST /api/signup {username, password}   -> create user (hash password on server!)
// POST /api/login  {username, password}   -> return session or token
// GET  /api/reviews                       -> list reviews
// POST /api/reviews {username, text, image} -> create review (server should verify token/session)
// PATCH /api/reviews/:id/like             -> increment like
// PATCH /api/reviews/:id/dislike          -> increment dislike
// POST /api/reviews/:id/reply             -> add reply

// If you want, I can also generate a small Express + MongoDB server file that uses the
// connection string you gave (but **I will not put your DB credentials in client-side code**).
