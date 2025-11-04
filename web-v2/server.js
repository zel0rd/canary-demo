import express from 'express';
const app = express();
app.get('/', (req, res) => {
  res.send('Hello from 🟣 v2 (canary)');
});
app.get('/health', (req, res) => res.send('ok'));
app.listen(3000, () => console.log('v2 running on 3000'));
