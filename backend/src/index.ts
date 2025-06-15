import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import express from 'express';
import cors from 'cors';
import { getMessagesForBranch, appendMessageToBranch, getBranchParent, setBranchParent, deleteBranch, setBranchTitle, createBranch } from '../controllers/chatController';
import { clerkMiddleware, requireAuth } from '@clerk/express';
const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

app.get('/messages/:branchId', requireAuth(), getMessagesForBranch);

app.post('/messages/:branchId', requireAuth(), appendMessageToBranch);

app.get('/parent/:branchId', requireAuth(), getBranchParent);

app.post('/parent/:branchId', requireAuth(), setBranchParent); 

app.delete('/branch/:branchId', requireAuth(), deleteBranch);

app.post('/title/:branchId', requireAuth(), setBranchTitle);

app.post('/branch', requireAuth(), createBranch);

app.listen(4000, () => {
    console.log("Express server is running on port 4000");
});
