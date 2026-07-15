# ijik-api

경험 카드 & 채용 공고 관리 REST API 서버.
Node.js + Express + MySQL. 운영 서버는 기존 Traefik 리버스 프록시 아래 Docker Compose로 배포한다.

이 저장소는 **독립 백엔드 포트폴리오**다. 실제 제품 `ijik-os`의 API·DB·LLM
파이프라인과 연결하거나 여기로 옮기지 않는다. 배포·Swagger 완결선 이후 신규 도메인
기능은 동결하고 테스트·보안·운영 하드닝만 진행한다.

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
Internet(:443) → Traefik → Express(:3000) → MySQL(:3306)
```

저장소의 `nginx/nginx.conf`는 Nginx를 사용하는 다른 환경을 위한 대안 설정이다.

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

## 리버스 프록시

현재 VPS는 Traefik이 80/443을 선점하며 `docker-compose.yml` 라벨로 연결한다.
`nginx/nginx.conf`는 Nginx 환경용 참고 설정이다. 실제 배포 절차는 `docs/DEPLOY.md`가 정본이다.

## 진행 상황

- `.claude/BACKLOG.md` — 다음 작업
- `.claude/PROGRESS.md` — 완료 이력 + git 상태
- `.claude/RETROSPECTIVE.md` — 회고

## 주의사항

- **시각/타임존 검증은 UTC 환경(Docker) 기준으로 한다.** 로컬 개발 환경은 시스템
  타임존이 KST라 타임존 버그가 우연히 가려진다. DB·앱 모두 UTC(`pool.js` `timezone: 'Z'`)로
  통일하고, KST 표시는 클라이언트에서 변환한다. (2026-07-10 9시간 오차 사고, RETROSPECTIVE 참조)
- `.env`는 Docker 모드(`DB_HOST=db`)와 로컬 모드(`DB_HOST=localhost`)가 다르다. 실행 방식에 맞게 설정.

## 작업 방식

- 세션 시작 시 `.claude/PROGRESS.md`와 `.claude/BACKLOG.md`를 읽고, SessionStart 훅의 origin/main 최신성 경고를 먼저 처리한다.
- 개발·테스트는 로컬이 기준이다. `npm test`, `npm run lint`, `git diff --check`를 통과한 의미 있는 작업 단위만 기록·커밋·푸시한다.
- 완료 내용은 `.claude/PROGRESS.md`, 남은 일과 새 발견은 `.claude/BACKLOG.md`, 재발 방지 교훈은 `.claude/RETROSPECTIVE.md`에 같은 작업 단위로 남긴다.
- 검증 실패 또는 미완성 상태는 자동 푸시하지 않고 진행 문서에 재개 지점을 기록한다.
- VPS 배포는 커밋·푸시와 별도인 릴리스 작업이다. 서버 변경 전 배포 범위와 영향도를 사용자에게 확인한다.
