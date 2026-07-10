# 배포 가이드 (Hostinger VPS, Ubuntu 24.04)

Docker Compose로 앱을 띄우고, 서브도메인 + Nginx 리버스 프록시 + Let's Encrypt
HTTPS로 외부에 공개한다. 기존 서버 설정(다른 앱의 Nginx 블록)은 건드리지 않고
**추가만** 한다.

> 아래 placeholder를 실제 값으로 바꿔서 실행한다.
> - `SUBDOMAIN` = 서브도메인 전체 (예: `api.example.com`)
> - `SERVER_IP` = VPS 공인 IP (`curl -s ifconfig.me`로 확인)
>
> 각 단계의 "✅ 성공 신호"가 나오면 다음으로 넘어간다.

---

## 0. 서버 접속

```bash
ssh 사용자명@SERVER_IP
```

✅ 서버 프롬프트로 바뀜.

---

## 1. Docker 설치 여부 확인

```bash
docker --version && docker compose version
```

- ✅ 버전 두 줄 출력 → 2단계로
- ❌ `command not found` → 설치:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## 2. 코드 내려받기

홈 디렉토리 기준 (Docker 배포라 경로는 자유, 홈이 권한 문제 없어 무난):

```bash
cd ~
git clone https://github.com/hhm0215/ijik-api.git
cd ijik-api
```

✅ `ls`에 `docker-compose.yml`, `Dockerfile`, `src` 보임.

---

## 3. 환경변수 설정

```bash
cp .env.example .env
nano .env
```

Docker 모드이므로 `DB_HOST=db` 유지, 비밀번호 2개를 서버용으로 새로 정한다:

```
PORT=3000
DB_HOST=db
DB_PORT=3306
DB_USER=ijik
DB_PASSWORD=서버용_강한_비밀번호
DB_ROOT_PASSWORD=다른_강한_비밀번호
DB_NAME=ijik_db
DB_CONNECTION_LIMIT=10
```

nano 저장: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 4. 컨테이너 기동

```bash
docker compose up -d --build
docker compose ps                     # ✅ app: Up / db: Up (healthy)
docker compose logs app | tail -5     # ✅ Database connected successfully.
```

서버 내부 동작 확인:

```bash
curl http://127.0.0.1:3000/api/v1/health
```

✅ `{"status":"ok","timestamp":"..."}`

> 앱은 `127.0.0.1:3000`으로만 바인딩되므로 외부에서 3000으로 직접 접근 불가.
> 외부 공개는 Nginx(아래)를 통해서만 이루어진다.

---

## 5. DNS — 서브도메인 A 레코드 추가

Hostinger 패널 → 도메인 → **DNS / Nameservers** → 레코드 추가:

| 항목 | 값 |
|------|-----|
| Type | `A` |
| Name (Host) | 서브도메인 라벨만 (예: `api`) |
| Points to | `SERVER_IP` |
| TTL | 기본값 |

전파 확인 (서버/로컬 어디서든):

```bash
dig +short SUBDOMAIN
```

✅ `SERVER_IP` 출력. (안 나오면 몇 분~수십 분 대기 후 재시도)

> **순서 이유**: 다음 단계 Certbot의 HTTP-01 인증은 SUBDOMAIN이 이 서버로
> 해석되어야 성공한다. DNS가 먼저다.

---

## 6. Nginx 서버 블록 추가 (HTTP)

```bash
sudo nano /etc/nginx/sites-available/ijik-api
```

```nginx
server {
    listen 80;
    server_name SUBDOMAIN;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    }
}
```

활성화:

```bash
sudo ln -s /etc/nginx/sites-available/ijik-api /etc/nginx/sites-enabled/
sudo nginx -t                      # ✅ syntax is ok / test is successful
sudo systemctl reload nginx
```

중간 확인:

```bash
curl http://SUBDOMAIN/api/v1/health    # ✅ {"status":"ok",...}
```

> ❌ `conflicting server name` 경고 → 기존 블록과 server_name 겹침.
> 다른 서브도메인을 쓰거나 기존 설정과 조율.

---

## 7. 방화벽 — 80, 443 허용

```bash
sudo ufw status
# active면:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Hostinger 패널 방화벽을 쓰면 패널에서도 80/443 허용 확인.

---

## 8. HTTPS — Certbot (Let's Encrypt)

```bash
sudo apt update && sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d SUBDOMAIN
```

- 이메일 입력, 약관 동의
- HTTP→HTTPS 리다이렉트 여부 → **redirect 선택**

Certbot이 Nginx 블록을 443 + SSL로 자동 수정하고 자동 갱신 타이머를 등록한다.

---

## 9. 최종 확인

```bash
curl https://SUBDOMAIN/api/v1/health       # ✅ {"status":"ok",...}
curl -I http://SUBDOMAIN/api/v1/health     # ✅ 301 → https 리다이렉트
sudo certbot renew --dry-run               # ✅ 자동 갱신 정상
```

브라우저: `https://SUBDOMAIN/api/v1/health` → 자물쇠 + JSON.

타임존 검증 (created_at이 현재 UTC와 일치해야 함):

```bash
curl -s -X POST https://SUBDOMAIN/api/v1/cards \
  -H "Content-Type: application/json" \
  -d '{"title":"deploy check","content":"https + utc"}'
```

---

## 이후 업데이트 배포

```bash
cd ~/ijik-api
git pull
docker compose up -d --build
```

---

## 문제 생기면

| 증상 | 확인 |
|------|------|
| app 안 뜸 | `docker compose logs app` |
| DB 연결 실패 | `docker compose logs db` + `.env` 비밀번호 |
| 502 Bad Gateway | `docker compose ps`로 app 생존 확인 |
| 외부 접속 불가 | 방화벽(ufw/패널) 80·443 + `dig`로 DNS 확인 |
| certbot 실패 | DNS 전파 여부(`dig`) + 80 포트 개방 여부 |

**롤백** (기존 서버 상태로 복귀):

```bash
sudo rm /etc/nginx/sites-enabled/ijik-api && sudo systemctl reload nginx
docker compose down
```
