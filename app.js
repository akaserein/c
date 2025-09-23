// File: public/App.js

import io from 'https://cdn.socket.io/4.7.1/socket.io.esm.min.js';

const socket = io();

// Parse URL parameters for username & room const urlParams = new URLSearchParams(window.location.search); const username = urlParams.get('user'); const room = urlParams.get('room'); document.getElementById('roomName').textContent = room;

const chatContainer = document.getElementById('chatMessages'); const messageInput = document.getElementById('messageInput'); const imageUrlInput = document.getElementById('imageUrl'); const sendBtn = document.getElementById('sendBtn');

// Join room socket.emit('joinRoom', {room, username});

// Helper: format timestamp function formatTime(ts){ const date = new Date(ts); return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); }

// Helper: create message element function createMessageElement(msg){ const div = document.createElement('div'); div.classList.add('review'); div.setAttribute('data-id', msg._id);

const avatar = document.createElement('div');
avatar.classList.add('avatar');
avatar.textContent = msg.username[0].toUpperCase();

const body = document.createElement('div');
body.classList.add('review-body');

const meta = document.createElement('div');
meta.classList.add('meta');
meta.innerHTML = `<span class='user'>${msg.username}</span><span class='time'>${formatTime(msg.timestamp)}</span>`;

const content = document.createElement('div');
content.classList.add('content-text');
content.textContent = msg.text;

body.appendChild(meta);
body.appendChild(content);

if(msg.image){
    const img = document.createElement('img');
    img.classList.add('review-img');
    img.src = msg.image;
    body.appendChild(img);
}

// Actions: Like, Dislike, Reply
const actions = document.createElement('div');
actions.classList.add('actions');
const likeBtn = document.createElement('button');
likeBtn.classList.add('small-btn');
likeBtn.textContent = `👍 ${msg.likes||0}`;
likeBtn.addEventListener('click', ()=>{ socket.emit('likeMessage', {id: msg._id, room}); });

const dislikeBtn = document.createElement('button');
dislikeBtn.classList.add('small-btn');
dislikeBtn.textContent = `👎 ${msg.dislikes||0}`;
dislikeBtn.addEventListener('click', ()=>{ socket.emit('dislikeMessage', {id: msg._id, room}); });

const replyBtn = document.createElement('button');
replyBtn.classList.add('small-btn');
replyBtn.textContent = 'Reply';
replyBtn.addEventListener('click', ()=>{
    const reply = prompt('Enter your reply:');
    if(reply) socket.emit('sendReply', {id: msg._id, reply, username, room});
});

actions.appendChild(likeBtn);
actions.appendChild(dislikeBtn);
actions.appendChild(replyBtn);
body.appendChild(actions);

// Replies
if(msg.replies && msg.replies.length > 0){
    const replyList = document.createElement('div');
    replyList.classList.add('reply-list');
    msg.replies.forEach(r=>{
        const rDiv = document.createElement('div');
        rDiv.classList.add('reply');
        rDiv.innerHTML = `<strong>${r.username}:</strong> ${r.text}`;
        replyList.appendChild(rDiv);
    });
    body.appendChild(replyList);
}

div.appendChild(avatar);
div.appendChild(body);

return div;

}

// Scroll chat to bottom function scrollToBottom(){ chatContainer.scrollTop = chatContainer.scrollHeight; }

// Load previous messages socket.on('loadMessages', (messages)=>{ chatContainer.innerHTML = ''; messages.forEach(msg=>{ const el = createMessageElement(msg); chatContainer.appendChild(el); }); scrollToBottom(); });

// New message from server socket.on('newMessage', (msg)=>{ const el = createMessageElement(msg); chatContainer.appendChild(el); scrollToBottom(); });

// Update message (like/dislike/replies) socket.on('updateMessage', (msg)=>{ const el = chatContainer.querySelector([data-id='${msg._id}']); if(el){ const newEl = createMessageElement(msg); chatContainer.replaceChild(newEl, el); } });

// Send message sendBtn.addEventListener('click', ()=>{ const text = messageInput.value.trim(); const image = imageUrlInput.value.trim(); if(!text && !image) return;

const data = {room, username, text, image};
socket.emit('sendMessage', data);

messageInput.value = '';
imageUrlInput.value = '';

});

// Optional: Enter key send messageInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendBtn.click(); } });

