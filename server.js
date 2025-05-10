// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// app.use('/', (req, res) => {
//   res.send('Signaling server is running!');
// });

// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // Store active users
// const users = {};

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);
  
//   // User registration
//   socket.on('register', (username) => {
//     console.log(`User ${username} registered with socket id: ${socket.id}`);
//     users[socket.id] = username;
    
//     // Broadcast updated user list to everyone
//     io.emit('update-user-list', getActiveUsers());
//   });
  
//   // Handle call requests
//   socket.on('call-user', (data) => {
//     const { userToCall, from, signal } = data;
//     console.log(`User ${from} is calling ${userToCall}`);
    
//     io.to(userToCall).emit('incoming-call', {
//       signal,
//       from,
//       name: users[socket.id]
//     });
//   });
  
//   // When the called user accepts
//   socket.on('answer-call', (data) => {
//     console.log(`Call answered by ${users[socket.id]}`);
//     io.to(data.to).emit('call-accepted', {
//       signal: data.signal,
//       name: users[socket.id]
//     });
//   });
  
//   // When a user ends the call
//   socket.on('end-call', (data) => {
//     console.log(`Call ended by ${users[socket.id]}`);
//     io.to(data.to).emit('call-ended');
//   });
  
//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log(`User ${users[socket.id]} disconnected`);
//     delete users[socket.id];
//     io.emit('update-user-list', getActiveUsers());
//   });
// });

// // Helper function to get active users
// function getActiveUsers() {
//   const activeUsers = [];
//   for (const [id, username] of Object.entries(users)) {
//     activeUsers.push({ id, username });
//   }
//   return activeUsers;
// }

// // Start the server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Signaling server running on port ${PORT}`);
// });

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => res.send('Signaling server is running!'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

const users = {};

io.on('connection', socket => {
  console.log('A user connected:', socket.id);

  socket.on('register', username => {
    users[socket.id] = username;
    io.emit('update-user-list', makeUserList());
  });

  socket.on('call-user', ({ userToCall, from, signal }) => {
    io.to(userToCall).emit('incoming-call', {
      from, name: users[socket.id], signal
    });
  });

  socket.on('answer-call', ({ to, signal }) => {
    io.to(to).emit('call-accepted', {
      signal, name: users[socket.id]
    });
  });

  socket.on('end-call', ({ to }) => {
    io.to(to).emit('call-ended');
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('update-user-list', makeUserList());
  });
});

function makeUserList() {
  return Object.entries(users).map(([id, username]) => ({ id, username }));
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
