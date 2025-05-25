import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import express from 'express';
import cors from 'cors';
import { getMessagesForBranch, appendMessageToBranch, getBranchParent, setBranchParent, deleteBranch, setBranchTitle, createBranch } from '../controllers/chatController';
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

app.get('/messages/:branchId', getMessagesForBranch);

app.post('/messages/:branchId', appendMessageToBranch);

app.get('/parent/:branchId', getBranchParent);

app.post('/parent/:branchId', setBranchParent); 

app.delete('/branch/:branchId', deleteBranch);

app.post('/title/:branchId', setBranchTitle);

app.post('/branch', createBranch);

app.listen(3000, () => {
    console.log("Express server is running on port 3000");
});
