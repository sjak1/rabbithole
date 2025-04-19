import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

app.listen(3000, () => {
    console.log("Express server is running on port 3000");
});