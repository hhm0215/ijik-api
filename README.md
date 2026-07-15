# ijik-api

경험 카드와 채용 공고를 관리하는 REST API 서버.

> 이 저장소는 백엔드 포트폴리오용 독립 REST API다. 실제 제품인 `ijik-os`는
> 별도 Next.js 풀스택 저장소로 운영하며, 두 프로젝트의 API·DB·LLM 파이프라인은
> 연결하지 않는다. 구조 통합은 명시적인 제품 아키텍처 전환 결정이 있을 때만 검토한다.

## Architecture

```
Client
  │
  ▼ :443
Traefik (deployed reverse proxy)
  │
  ▼ :3000
Express (API server)
  │
  ▼ :3306
MySQL
```

## Tech Stack

| 구분 | 기술 |
|------|------|
| Runtime | Node.js |
| Framework | Express |
| Database | MySQL + mysql2 (connection pool) |
| Runtime deployment | Docker Compose |
| Reverse proxy | Traefik (현재 VPS), Nginx (대안 설정) |

## Project Structure

```
src/
├── server.js          진입점, graceful shutdown
├── app.js             미들웨어 체인, 라우터 마운트
├── db/
│   └── pool.js        MySQL 커넥션 풀
├── routes/            URL 바인딩
├── controllers/       요청/응답 처리
├── services/          비즈니스 로직
└── repositories/      DB 쿼리
nginx/
└── nginx.conf         리버스 프록시 설정
schema.sql             테이블 정의
```

## Getting Started

### 1. 환경변수 설정

```bash
cp .env.example .env
# .env 파일에서 DB 접속 정보 수정
```

### 2. DB 초기화

```bash
mysql -u root -p < schema.sql
```

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev    # 개발 (nodemon)
npm start      # 프로덕션
```

## API Endpoints

Base URL: `/api/v1`

- Interactive documentation: `/api-docs`
- OpenAPI JSON: `/api-docs.json`

### Health

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 서버 상태 확인 |

### Experience Cards

| Method | Path | 설명 |
|--------|------|------|
| GET | `/cards` | 목록 조회 |
| GET | `/cards/:id` | 단건 조회 |
| POST | `/cards` | 생성 |
| PUT | `/cards/:id` | 수정 |
| DELETE | `/cards/:id` | 삭제 (soft delete) |

**Request body (POST/PUT):**
```json
{
  "title": "string (필수)",
  "content": "string (필수)",
  "tags": "string (선택, 쉼표 구분)"
}
```

### Job Postings

| Method | Path | 설명 |
|--------|------|------|
| GET | `/postings` | 목록 조회 |
| GET | `/postings/:id` | 단건 조회 |
| POST | `/postings` | 생성 |
| PUT | `/postings/:id` | 수정 |
| DELETE | `/postings/:id` | 삭제 |

**Request body (POST/PUT):**
```json
{
  "company": "string (필수)",
  "title": "string (필수)",
  "url": "string (선택)",
  "status": "open | applied | closed (선택, 기본값: open)"
}
```

## Alternative Nginx Setup

현재 Hostinger VPS 배포는 기존 Traefik을 사용한다. 아래는 80/443에 다른 프록시가
없는 별도 Linux 서버에서 Nginx를 선택할 때만 쓰는 대안 절차다. 현재 운영 절차는
[`docs/DEPLOY.md`](docs/DEPLOY.md)를 따른다.

### Linux (Ubuntu) 배포

```bash
# Nginx 설치
sudo apt install nginx

# 설정 파일 복사
sudo cp nginx/nginx.conf /etc/nginx/sites-available/ijik-api
sudo ln -s /etc/nginx/sites-available/ijik-api /etc/nginx/sites-enabled/

# 설정 검증 및 재시작
sudo nginx -t
sudo systemctl restart nginx
```

### PM2로 프로세스 관리 (Docker를 사용하지 않는 경우)

```bash
npm install -g pm2
pm2 start src/server.js --name ijik-api
pm2 save
pm2 startup   # 서버 재시작 시 자동 실행 등록
```

## Response Format

```json
// 성공
{ "success": true, "data": { ... } }

// 실패
{ "success": false, "error": "메시지" }
```

## API Contract & External Beta

- OpenAPI 계약: [`docs/openapi.yaml`](docs/openapi.yaml)
- 외부 실사용·제한 베타 운영 기준: [`docs/EXTERNAL_BETA.md`](docs/EXTERNAL_BETA.md)
- 회귀 검증: `npm test`
