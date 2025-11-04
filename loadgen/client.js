import fetch from 'node-fetch';

async function loop() {
  while (true) {
    const res = await fetch('http://nginx');
    const text = await res.text();
    console.log(`[${new Date().toLocaleTimeString()}] → ${text}`);
    await new Promise(r => setTimeout(r, 500)); // 0.5초마다 요청
  }
}

loop().catch(console.error);
