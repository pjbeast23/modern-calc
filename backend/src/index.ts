import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import Clerk, { ClerkExpressRequireAuth, clerkClient} from '@clerk/clerk-sdk-node';

dotenv.config();

// const requireAuth = ClerkExpressRequireAuth();
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
// app.use(requireAuth);
(async () => {
  const userList = await clerkClient.users.getUserList();
  console.log(userList);
})();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});


io.on('connection', (socket) => {
    console.log('New client connected');
  
    socket.on('update-cell', (data) => {
        io.sockets.emit('update-cell', data);
    });
  
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.post('/auth', async (req, res) => {
  try {
    const {userId, email} = req.body;
    const user = await clerkClient.users.getUser(userId);
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0].emailAddress,
        },
      });
    }
    res.status(200).json({ message: 'User authenticated' });
  }
  catch (error:any) {
    res.status(400).json(error?.message);
  }
});


app.post('/worksheets', async (req, res) => {
  const { userId,title, content } = req.body;

  const user = await prisma.user.findUnique({
    where: { clerkId: String(userId) },
  });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const workbook = await prisma.worksheet.create({
    data: {
      title,
      content,
      userId: user.id,
    },
  });

  res.status(201).json(workbook);
});

app.get('/worksheets', async (req, res) => {
  const {userId, email} = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'User not found' });
  }
  const user = await prisma.user.findUnique({
    where: { clerkId: String(userId) },
  });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const workbooks = await prisma.worksheet.findMany({
    where: { userId: user.id },
  });

  res.status(200).json(workbooks);
});

app.get('/worksheets/:id', async (req, res) => {
  const { id } = req.params;
  const workbook = await prisma.worksheet.findUnique({
    where: { id: id },
  });
  if (!workbook) {
    return res.status(404).json({ message: 'Workbook not found' });
  }
  res.status(200).json(workbook);
});

// Similar endpoints can be created for updating and deleting workbooks


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`app is runnning on localhost:${PORT}`));
