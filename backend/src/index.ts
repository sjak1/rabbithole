import express from 'express';
import { getMessagesForBranch, setMessagesForBranch } from '../controllers/chatController';
const app = express();

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

app.get('/messages/:branchId', getMessagesForBranch);

app.post('/messages/:branchId', setMessagesForBranch);

app.listen(3000, () => {
    console.log("Express server is running on port 3000");
});