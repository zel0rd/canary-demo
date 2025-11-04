import fetch from 'node-fetch';

async function loop() {
  while (true) {
    try {
      const res = await fetch('http://nginx');
      const text = await res.text();
      console.log(`[${new Date().toLocaleTimeString()}] → ${text}`);
    } catch (error) {
      // 연결 실패 시 에러 로그만 출력하고 계속 시도
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log(`[${new Date().toLocaleTimeString()}] ⚠️  연결 실패 (재시도 중...)`);
      } else {
        console.error(`[${new Date().toLocaleTimeString()}] ❌ 에러:`, error.message);
      }
    }
    await new Promise(r => setTimeout(r, 500)); // 0.5초마다 요청
  }
}

console.log('🚀 Load Generator 시작...');
loop().catch(console.error);
