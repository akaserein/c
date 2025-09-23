const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ---- MongoDB setup ----
const mongoURI = 'mongodb+srv://donebiall_db_user:<db_3gVEJJ18xKmThNeL>@cluster0.lggtfpk.mongodb.net/chatroom_db?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>console.log('MongoDB connected'))
    .catch(err=>console.log(err));

const messageSchema = new mongoose.Schema({
    room: String,
    username: String,
    text: String,
    image: String,
    likes: {type: Number, default: 0},
    dislikes: {type: Number, default: 0},
    replies: {type: Array, default: []},
    timestamp: {type: Date, default: Date.now}
});

const Message = mongoose.model('Message', messageSchema);

// ---- Socket.IO ----
io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('joinRoom', async ({room, username}) => {
        socket.join(room);
        console.log(`${username} joined room: ${room}`);

        // Load previous messages for this room
        const messages = await Message.find({room}).sort({timestamp: 1});
        socket.emit('loadMessages', messages);
    });

    socket.on('sendMessage', async (data) => {
        const msg = new Message(data);
        await msg.save();
        io.to(data.room).emit('newMessage', msg);
    });

    socket.on('likeMessage', async ({id, room}) => {
        const msg = await Message.findById(id);
        if(msg){
            msg.likes += 1;
            await msg.save();
            io.to(room).emit('updateMessage', msg);
        }
    });

    socket.on('dislikeMessage', async ({id, room}) => {
        const msg = await Message.findById(id);
        if(msg){
            msg.dislikes += 1;
            await msg.save();
            io.to(room).emit('updateMessage', msg);
        }
    });

    socket.on('sendReply', async ({id, reply, username, room}) => {
        const msg = await Message.findById(id);
        if(msg){
            msg.replies.push({username, text: reply, timestamp: new Date()});
            await msg.save();
            io.to(room).emit('updateMessage', msg);
        }
    });
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
