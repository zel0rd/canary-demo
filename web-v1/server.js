import express from 'express';
const app = express();
app.get('/', (req, res) => {
  res.send('Hello from 🟢 v1 (stable)');
});
app.get('/health', (req, res) => res.send('ok'));
app.listen(3000, () => console.log('v1 running on 3000'));
