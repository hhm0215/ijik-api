# 배포 가이드 (Hostinger VPS, Ubuntu 24.04)

Docker Compose로 배포한다. 기존 서버 설정(OpenClaw 등)은 건드리지 않고
Nginx 서버 블록만 추가한다.

> 아래 명령을 **위에서부터 순서대로** 서버 터미널에 붙여넣는다.
> 각 단계의 "✅ 성공 신호"가 나오면 다음으로 넘어간다.

---

## 0. 서버 접속

로컬(맥) 터미널에서:

```bash
ssh 사용자명@서버IP
```

✅ 성공 신호: 서버 프롬프트(`사용자명@호스트:~$`)로 바뀜.

---

## 1. Docker 설치 여부 확인

```bash
docker --version && docker compose version
```

- ✅ 버전이 두 줄 나오면 → **2단계로 건너뜀**
- ❌ `command not found` 나오면 → 아래 설치 진행

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

✅ 성공 신호: `Docker version 2x.x.x` 출력.

---

## 2. 코드 내려받기

```bash
git clone https://github.com/hhm0215/ijik-api.git
cd ijik-api
```

✅ 성공 신호: `ls` 했을 때 `docker-compose.yml`, `Dockerfile`, `src` 등이 보임.

---

## 3. 환경변수 설정

```bash
cp .env.example .env
nano .env
```

`.env`에서 아래 값을 채운다 (Docker 모드이므로 `DB_HOST=db` 유지):

```
PORT=3000
DB_HOST=db
DB_PORT=3306
DB_USER=ijik
DB_PASSWORD=여기에_강한_비밀번호
DB_ROOT_PASSWORD=여기에_다른_강한_비밀번호
DB_NAME=ijik_db
DB_CONNECTION_LIMIT=10
```

nano 저장: `Ctrl+O` → `Enter` → `Ctrl+X`

✅ 성공 신호: `cat .env`로 값이 채워진 것 확인.

> ⚠️ 비밀번호는 로컬에서 쓰던 `ijik123!` 말고 서버용으로 새로 강하게 정한다.

---

## 4. 컨테이너 기동

```bash
docker compose up -d --build
```

✅ 성공 신호: 마지막에 `Container ijik-api-app-1 Started` 출력.

상태 확인:

```bash
docker compose ps
```

✅ 성공 신호: `app`은 `Up`, `db`는 `Up (healthy)`.

로그로 DB 연결 확인:

```bash
docker compose logs app | tail -5
```

✅ 성공 신호: `Database connected successfully.` + `Server running on port 3000`.

---

## 5. 서버 내부에서 동작 확인

```bash
curl http://127.0.0.1:3000/api/v1/health
```

✅ 성공 신호: `{"status":"ok","timestamp":"..."}`

---

## 6. Nginx 리버스 프록시 추가

> 기존 Nginx 설정은 그대로 두고 새 서버 블록만 추가한다.

```bash
sudo nano /etc/nginx/sites-available/ijik-api
```

아래 내용 붙여넣기 (`server_name`만 실제 IP나 도메인으로 교체):

```nginx
server {
    listen 80;
    server_name 서버IP또는도메인;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    }
}
```

저장 후 활성화:

```bash
sudo ln -s /etc/nginx/sites-available/ijik-api /etc/nginx/sites-enabled/
sudo nginx -t
```

✅ 성공 신호: `syntax is ok` + `test is successful`.

> ❌ `conflicting server name` 경고가 나오면 → 기존 서버 블록과 도메인이 겹친 것.
> `server_name`을 다른 도메인/서브도메인으로 바꾸거나, 기존 설정과 조율 필요. (공유해줄 것)

적용:

```bash
sudo systemctl reload nginx
```

---

## 7. 방화벽 (Express 포트 외부 차단)

docker-compose.yml에서 이미 `127.0.0.1:3000`으로만 바인딩하므로 3000은
외부에서 안 보인다. 80만 열려 있으면 된다.

```bash
sudo ufw status
```

- 방화벽이 `active`면: `sudo ufw allow 80/tcp` 확인
- Hostinger 패널의 방화벽을 쓴다면 패널에서 80 허용

---

## 8. 외부에서 최종 확인

로컬(맥) 터미널 또는 브라우저에서:

```bash
curl http://서버IP/api/v1/health
```

✅ 최종 성공: `{"status":"ok",...}` 응답.

---

## 이후 업데이트 배포 (코드 수정 후)

```bash
cd ijik-api
git pull
docker compose up -d --build
```

---

## 문제 생기면 확인할 것

| 증상 | 확인 명령 |
|------|-----------|
| app이 안 뜸 | `docker compose logs app` |
| DB 연결 실패 | `docker compose logs db` + `.env` 비밀번호 확인 |
| 502 Bad Gateway | app 컨테이너 살아있는지 `docker compose ps` |
| 외부 접속 안 됨 | 방화벽(ufw / Hostinger 패널)에서 80 허용 여부 |

각 단계에서 막히면 해당 명령의 **출력 전체를 복사해서 공유**하면 같이 본다.
