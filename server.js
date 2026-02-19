const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const filmStudySessions = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
    },
    path: '/api/socketio',
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-session', (data) => {
      const roomId = 'film-study-' + data.videoId;
      socket.join(roomId);
      socket.data = { 
        videoId: data.videoId, 
        odataId: data.odataId, 
        userName: data.userName, 
        userRole: data.userRole, 
        roomId: roomId 
      };
      
      if (!filmStudySessions.has(roomId)) {
        filmStudySessions.set(roomId, {
          participants: [],
          currentTime: 0,
          isPlaying: false,
          duration: 0,
          drawings: [],
        });
      }
      
      const session = filmStudySessions.get(roomId);
      
      // Check if user already exists (by odataId) and update their socket, or add new
      const existingIndex = session.participants.findIndex(function(p) {
        return p.odataId === data.odataId;
      });
      
      if (existingIndex !== -1) {
        // Update existing user's socket ID (they refreshed)
        session.participants[existingIndex].socketId = socket.id;
        session.participants[existingIndex].name = data.userName;
        session.participants[existingIndex].role = data.userRole;
      } else {
        // Add new participant
        session.participants.push({ 
          odataId: data.odataId, 
          socketId: socket.id, 
          name: data.userName, 
          role: data.userRole 
        });
      }
      
      socket.to(roomId).emit('user-joined', { 
        odataId: data.odataId,
        userName: data.userName, 
        userRole: data.userRole,
        participants: session.participants 
      });
      
      socket.emit('session-state', {
        participants: session.participants,
        currentTime: session.currentTime,
        isPlaying: session.isPlaying,
        duration: session.duration,
        drawings: session.drawings,
      });
      
      console.log(data.userName + ' joined session ' + roomId);
    });

    socket.on('draw-stroke', (data) => {
      const socketData = socket.data || {};
      if (!socketData.roomId) return;
      
      const session = filmStudySessions.get(socketData.roomId);
      if (session) {
        const strokeData = Object.assign({}, data.stroke, { 
          odataId: socketData.odataId, 
          userName: socketData.userName 
        });
        session.drawings.push(strokeData);
      }
      
      socket.to(socketData.roomId).emit('stroke-received', { 
        stroke: data.stroke, 
        fromUserId: socketData.odataId,
        fromUserName: socketData.userName 
      });
    });

    socket.on('clear-canvas', () => {
      const socketData = socket.data || {};
      if (!socketData.roomId) return;
      
      const session = filmStudySessions.get(socketData.roomId);
      if (session) {
        session.drawings = [];
      }
      
      socket.to(socketData.roomId).emit('canvas-cleared', { 
        byUserId: socketData.odataId,
        byUserName: socketData.userName 
      });
    });

    // Marker sync events
    socket.on('marker-added', (data) => {
      const socketData = socket.data || {};
      if (!socketData.roomId) return;
      if (socketData.userRole !== 'COACH' && socketData.userRole !== 'ADMIN') return;
      
      socket.to(socketData.roomId).emit('marker-synced', {
        action: 'add',
        marker: data.marker,
        byUserName: socketData.userName
      });
    });

    socket.on('marker-deleted', (data) => {
      const socketData = socket.data || {};
      if (!socketData.roomId) return;
      if (socketData.userRole !== 'COACH' && socketData.userRole !== 'ADMIN') return;
      
      socket.to(socketData.roomId).emit('marker-synced', {
        action: 'delete',
        markerId: data.markerId,
        byUserName: socketData.userName
      });
    });

    socket.on('sync-playback', (data) => {
      const socketData = socket.data || {};
      if (!socketData.roomId) return;
      if (socketData.userRole !== 'COACH' && socketData.userRole !== 'ADMIN') return;
      
      const session = filmStudySessions.get(socketData.roomId);
      if (session) {
        session.currentTime = data.time;
        session.isPlaying = data.playing;
        if (data.duration) {
          session.duration = data.duration;
        }
      }
      
      socket.to(socketData.roomId).emit('playback-synced', { 
        time: data.time, 
        playing: data.playing,
        duration: data.duration || session?.duration
      });
    });

    socket.on('disconnect', () => {
      const socketData = socket.data || {};
      
      if (socketData.roomId && filmStudySessions.has(socketData.roomId)) {
        const session = filmStudySessions.get(socketData.roomId);
        session.participants = session.participants.filter(function(p) {
          return p.socketId !== socket.id;
        });
        
        socket.to(socketData.roomId).emit('user-left', { 
          odataId: socketData.odataId,
          userName: socketData.userName,
          participants: session.participants 
        });
        
        if (session.participants.length === 0) {
          filmStudySessions.delete(socketData.roomId);
        }
        
        console.log((socketData.userName || 'Unknown') + ' left session ' + socketData.roomId);
      }
      
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(port, () => {
    console.log('> Ready on http://' + hostname + ':' + port);
    console.log('> Socket.IO server running on /api/socketio');
  });
});
