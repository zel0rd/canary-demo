# Canary Deployment Demo 🚀

Nginx를 사용한 카나리 배포(Canary Deployment) 데모 프로젝트입니다.

## 📋 프로젝트 구조

```
canary-demo/
├── web-v1/              # 안정 버전 (v1) 서버
│   ├── server.js
│   └── package.json
├── web-v2/              # 카나리 버전 (v2) 서버
│   ├── server.js
│   └── package.json
├── loadgen/             # 부하 생성 클라이언트
│   ├── client.js
│   └── package.json
├── nginx.conf           # Nginx 카나리 배포 설정
├── docker-compose.yml   # Docker Compose 설정
└── README.md
```

## 🎯 카나리 배포란?

카나리 배포는 새로운 버전을 일부 사용자에게만 먼저 배포하여 안정성을 검증하는 배포 전략입니다.

이 데모에서는:
- **90%** 트래픽 → v1 (안정 버전) 🟢
- **10%** 트래픽 → v2 (카나리 버전) 🟣

## 🚀 실행 방법

### 1. Docker Compose로 모든 서비스 시작

```bash
docker-compose up
```

또는 백그라운드로 실행:

```bash
docker-compose up -d
```

### 2. 로그 확인

실시간 로그를 보려면:

```bash
docker-compose logs -f
```

특정 서비스만 보려면:

```bash
docker-compose logs -f nginx
docker-compose logs -f loadgen
```

### 3. 서비스 중지

```bash
docker compose down
```

## 🔧 설정 수정 후 재기동

### nginx.conf 수정 후

**방법 1: nginx만 재시작 (권장)**

```bash
docker compose restart nginx
```

**방법 2: 전체 재시작**

```bash
docker compose down
docker compose up
```

**방법 3: nginx 설정만 리로드 (다운타임 없음)**

```bash
docker compose exec nginx nginx -s reload
```

### 애플리케이션 코드 수정 후 (web-v1, web-v2)

```bash
# 특정 서비스만 재시작
docker compose restart web-v1
docker compose restart web-v2

# 또는 전체 재시작
docker compose down
docker compose up
```

## 🧪 테스트

### 브라우저에서 테스트

```
http://localhost:8080
```

새로고침을 여러 번 하면 약 10% 확률로 v2가 나타납니다.

### curl로 테스트

```bash
# 여러 번 요청하여 분산 확인
for i in {1..20}; do curl http://localhost:8080; echo ""; done
```

### 쿠키로 카나리 버전 고정

한 번 카나리 버전에 할당되면 쿠키를 통해 계속 같은 버전으로 라우팅됩니다:

```bash
# 카나리 버전으로 고정
curl -H "Cookie: canary=1" http://localhost:8080
```

## 📊 카나리 배포 동작 원리

### 1. 트래픽 분산 (split_clients)

`nginx.conf`에서 `split_clients`를 사용하여 요청을 10%/90%로 분산:

```nginx
split_clients "${remote_addr}${http_user_agent}${request_id}" $split_bucket {
  10%     canary;
  *       stable;
}
```

### 2. 쿠키 기반 고정 (Sticky Session)

한 번 카나리에 할당된 사용자는 쿠키를 통해 계속 카나리 버전 사용:

```nginx
map $cookie_canary $force_canary {
  "1" 1;
  default 0;
}
```

### 3. 업스트림 선택

```nginx
map "$force_canary:$split_bucket" $target_upstream {
  "1:canary"  canary_upstream;   # 쿠키 있고 split canary → canary
  "1:stable"  canary_upstream;   # 쿠키 있고 split stable → canary
  "0:canary"  canary_upstream;   # 쿠키 없고 추첨 당첨 → canary
  default     stable_upstream;   # 그 외 → stable
}
```

## 📈 트래픽 비율 조정

`nginx.conf`에서 비율 변경:

```nginx
split_clients "${remote_addr}${http_user_agent}${request_id}" $split_bucket {
  20%     canary;   # 20%로 변경
  *       stable;
}
```

수정 후:

```bash
docker-compose restart nginx
```

## 🐛 문제 해결

### 컨테이너가 시작되지 않을 때

```bash
# 로그 확인
docker-compose logs

# 컨테이너 상태 확인
docker-compose ps

# 완전히 제거 후 재시작
docker-compose down -v
docker-compose up
```

### nginx가 upstream을 찾지 못할 때

web-v1, web-v2가 먼저 시작되어야 합니다. `depends_on`이 설정되어 있지만, 완전히 준비되기 전에 nginx가 시작될 수 있습니다:

```bash
# 순서대로 재시작
docker-compose restart web-v1 web-v2
docker-compose restart nginx
```

## 📝 참고사항

- **loadgen**: 0.5초마다 nginx로 요청을 보내는 부하 생성기
- **포트**: 8080번 포트로 서비스 접근
- **로그**: nginx 로그에서 어느 upstream으로 라우팅되었는지 확인 가능

## 🔗 관련 링크

- [Nginx 공식 문서 - split_clients](http://nginx.org/en/docs/http/ngx_http_split_clients_module.html)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)

