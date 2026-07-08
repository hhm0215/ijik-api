# ijik-api

경험 카드 & 채용 공고 관리 REST API 서버.
Node.js + Express + MySQL, Nginx 리버스 프록시 구성.

## 빌드 & 실행

```bash
npm install
cp .env.example .env   # DB 접속 정보 입력
mysql -u root -p < schema.sql
npm run dev            # 개발 (nodemon)
npm start              # 프로덕션
npm run lint           # ESLint
```

## 아키텍처

```
Client → Nginx(:80) → Express(:3000) → MySQL(:3306)
```

## 서비스 구조

```
src/
├── server.js          진입점
├── app.js             미들웨어 체인
├── db/pool.js         MySQL 커넥션 풀
├── routes/            URL 바인딩
├── controllers/       요청/응답 처리
├── services/          비즈니스 로직
└── repositories/      DB 쿼리
```

## API

Base: `/api/v1`

- `GET/POST /cards` — 경험 카드 목록/생성
- `GET/PUT/DELETE /cards/:id` — 경험 카드 단건 (삭제는 soft delete)
- `GET/POST /postings` — 채용 공고 목록/생성
- `GET/PUT/DELETE /postings/:id` — 채용 공고 단건

## 환경변수

`.env.example` 참고. DB 접속 정보, 포트 설정.

## Nginx

`nginx/nginx.conf` — 리버스 프록시 설정.
Linux 배포 시 `/etc/nginx/sites-available/`에 복사.

## 진행 상황

- `.claude/BACKLOG.md` — 다음 작업
- `.claude/PROGRESS.md` — 완료 이력 + git 상태
- `.claude/RETROSPECTIVE.md` — 회고
