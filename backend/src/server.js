require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');
const connectDB  = require('./config/db');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' },
});

app.locals.io = io;

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const jwt     = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  socket.join(socket.userId);
  console.log(`WS: user ${socket.userId} connected`);
  socket.on('disconnect', () => console.log(`WS: user ${socket.userId} disconnected`));
});

connectDB();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets',      require('./routes/budgets'));
app.use('/api/insights',     require('./routes/insights'));
app.use('/api/reports',      require('./routes/reports'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));