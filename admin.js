// admin.js - handles admin-dashboard.html actions
import { db, storage } from "./firebase.js";
import {
  ref,
  push,
  set,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  remove,
  query,
  orderByChild
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  ref as sRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// check login
const adminUser = localStorage.getItem('boxi_admin');
if(!adminUser){
  location.href = 'admin-login.html';
}

// DOM
const postText = document.getElementById('postText');
const postImage = document.getElementById('postImage');
const postBtn = document.getElementById('postBtn');
const clearBtn = document.getElementById('clearBtn');
const postMsg = document.getElementById('postMsg');
const manageList = document.getElementById('manageList');
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn?.addEventListener('click', ()=>{
  localStorage.removeItem('boxi_admin');
  location.href = 'index.html';
});

postBtn.addEventListener('click', async () => {
  const text = (postText.value || '').trim();
  const file = postImage.files[0];

  if(!text && !file){
    postMsg.textContent = 'Write something or attach an image';
    return;
  }
  postMsg.textContent = 'Posting...';
  postBtn.disabled = true;

  try {
    let imageURL = '';
    if(file){
      const path = 'images/' + Date.now() + '-' + file.name;
      const storageRef = sRef(storage, path);
      await uploadBytes(storageRef, file);
      imageURL = await getDownloadURL(storageRef);
    }

    const newRef = push(ref(db, 'updates'));
    await set(newRef, {
      text,
      imageURL,
      timestamp: Date.now(),
      admin: adminUser,
      likes: 0,
      storagePath: imageURL ? ('images/' + Date.now() + '-' + file.name) : ''
    });

    postMsg.textContent = 'Posted ✓';
    postText.value = '';
    postImage.value = '';
  } catch (e) {
    console.error(e);
    postMsg.textContent = 'Failed to post';
  } finally {
    postBtn.disabled = false;
    setTimeout(()=> postMsg.textContent = '', 1500);
  }
});

// load/manage updates realtime
const manageQuery = query(ref(db, 'updates'), orderByChild('timestamp'));
onChildAdded(manageQuery, snap => renderManageItem(snap.key, snap.val()));
onChildChanged(manageQuery, snap => {
  const el = document.getElementById('m-'+snap.key);
  if(el) el.remove();
  renderManageItem(snap.key, snap.val());
});
onChildRemoved(manageQuery, snap => {
  const el = document.getElementById('m-'+snap.key);
  if(el) el?.remove();
});

function renderManageItem(key, data){
  const item = document.createElement('div');
  item.className = 'card fade-in';
  item.id = 'm-'+key;

  const p = document.createElement('p');
  p.textContent = data.text || '';
  p.title = data.text || '';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const date = new Date(data.timestamp||Date.now());
  meta.innerHTML = `<div class="date">${isNaN(date.getTime()) ? '' : date.toLocaleString()}</div>
                    <div class="admin muted">${data.admin || ''}</div>`;

  const delBtn = document.createElement('button');
  delBtn.className = 'btn danger';
  delBtn.textContent = 'Delete';

  delBtn.addEventListener('click', async ()=>{
    if(!confirm('Delete this update for everyone?')) return;
    // if image exists, attempt delete from storage (best-effort)
    try {
      if(data.imageURL && data.storagePath){
        // if storagePath saved, delete that exact path. Otherwise try to derive (may fail)
        const sRefToDelete = sRef(storage, data.storagePath);
        await deleteObject(sRefToDelete).catch(()=>{/* ignore delete errors */});
      }
    } catch(e){ console.warn('delete image failed', e); }
    // remove DB node
    await remove(ref(db, 'updates/' + key));
  });

  item.appendChild(p);
  if(data.imageURL){
    const img = document.createElement('img');
    img.src = data.imageURL;
    img.loading = 'lazy';
    item.appendChild(img);
  }
  item.appendChild(meta);
  const controls = document.createElement('div');
  controls.className = 'row';
  controls.appendChild(delBtn);
  item.appendChild(controls);

  manageList.prepend(item);
}
