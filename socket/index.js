const { sendMessage } = require('./events/sendMessage');
const { sendNotification } = require('./events/sendNotification');
const { addUser, removeUser, getUser } = require('./_helpers');
const { sendConversation } = require('./events/sendConversation');
const { sendScrimMessage } = require('./events/sendScrimMessage');

require('dotenv').config();
const allowedOrigins = require('../config/allowed-origins.json');

const createSocket = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: allowedOrigins[process.env.NODE_ENV || 'development'],
      credentials: true,
    },
    path: '/socket.io', // specify the namespace path here
  });

  io.on('connection', (socket) => {
    // when connect-
    console.log('a user connected');

    // io.emit('welcome', 'hello this is socket server'); // send to every client (public) (eventName, result)

    // take userId and socketId from user
    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', global.socketUsers); // emit to client
    });

    // sendMessage, sendConversation, sendNotification are now handled directly by backend controllers

    // just checking that scrim chat has been opened or closed
    socket.on('scrimChatOpen', async ({ userId, scrimId }) => {
      console.log('ScrimChatOpen', userId, scrimId);

      return;
    });
    socket.on('scrimChatClose', async () => {
      console.log('scrimChatClose');
    });

    // sendScrimMessage is now handled directly by backend controllers

    // Join scrim room for real-time updates
    socket.on('join_scrim_room', ({ scrimId }) => {
      if (scrimId) {
        const room = `scrim_${scrimId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      }
    });

    // Leave scrim room
    socket.on('leave_scrim_room', ({ scrimId }) => {
      if (scrimId) {
        const room = `scrim_${scrimId}`;
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
      }
    });

    // sendScrimTransaction is now handled directly by backend controllers

    // when disconnect
    // add unsubscribe event listener
    socket.on('disconnect', () => {
      console.log('a user disconnected!');
      removeUser(socket.id);
      io.emit('getUsers', global.socketUsers); // emit to client (return new users state)

      return;
    });
  });

  return io;
};

module.exports = createSocket;
