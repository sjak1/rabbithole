import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import express from 'express';
import cors from 'cors';
import { getMessagesForBranch, appendMessageToBranch, getBranchParent, setBranchParent, deleteBranch, setBranchTitle, createBranch, getBranchesForUser, generateBranchTitle, getUser } from './controllers/chatController';
import { clerkMiddleware, requireAuth } from '@clerk/express';
const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(clerkMiddleware());

// User
app.get('/api/user', requireAuth(), getUser);

// Branch
app.post('/branch', requireAuth(), createBranch);
app.get('/branches', requireAuth(), getBranchesForUser);
app.delete('/branch/:id', requireAuth(), deleteBranch);

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello from Express!');
});

app.get('/messages/:branchId', requireAuth(), getMessagesForBranch);

app.post('/messages/:branchId', requireAuth(), appendMessageToBranch);

app.get('/parent/:branchId', requireAuth(), getBranchParent);

app.post('/parent/:branchId', requireAuth(), setBranchParent); 

app.post('/title/:branchId', requireAuth(), setBranchTitle);

app.post('/title/generate/:branchId', requireAuth(), generateBranchTitle);

app.listen(4000, () => {
    console.log("Express server is running on port 4000");
});
