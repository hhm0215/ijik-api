# PROGRESS

## 현재 git 상태

- 브랜치: main
- 최신 커밋: ab6e434 — feat: add input validation layer (validators + AppError)
- 원격: origin/main 동기화 완료
- GitHub: https://github.com/hhm0215/ijik-api
- 미커밋 변경: 없음
- ⚠️ 서버 컨테이너는 검증 계층 이전 코드로 기동 중 — 서버에서 git pull + docker compose up -d --build 필요

## 완료된 작업

- 2026-07-08 | 프로젝트 초기 세팅 (디렉토리 구조, package.json, .env, ESLint, .gitignore)
- 2026-07-08 | Express 앱 구조 (server.js, app.js, 미들웨어 체인, 전역 에러 핸들러)
- 2026-07-08 | MySQL 커넥션 풀 (mysql2/promise, 시작 시 연결 검증, graceful shutdown)
- 2026-07-08 | experience_cards CRUD (soft delete) — repository/service/controller/route
- 2026-07-08 | job_postings CRUD — repository/service/controller/route
- 2026-07-08 | schema.sql (experience_cards, job_postings 테이블)
- 2026-07-08 | Nginx 리버스 프록시 설정 (nginx/nginx.conf)
- 2026-07-08 | SETUP_NOTES.md (기술 결정 근거 11개 항목)
- 2026-07-08 | README.md (아키텍처 다이어그램, API 명세, 배포 가이드)
- 2026-07-08 | Docker 지원 (Dockerfile, docker-compose.yml, .dockerignore)
- 2026-07-08 | GitHub 공개 저장소 생성 및 푸시
- 2026-07-10 | Docker Compose 로컬 배포 검증 (app + MySQL 8.0, schema 자동적용, CRUD 전 구간, 한글/이모지 utf8mb4 왕복, soft delete 확인)
- 2026-07-10 | 타임존 9시간 오차 버그 수정 — **최종안: pool.js timezone '+09:00' → 'Z' UTC 통일 (커밋 1a95778)**. 다른 세션에서 시도한 compose `--default-time-zone=+09:00`(KST 고정)안은 UTC 통일 결정으로 폐기·되돌림 (2026-07-11). CLAUDE.md 주의사항 참조
- 2026-07-10 | Nginx 설정 검증 — 일회용 nginx:alpine 컨테이너에 repo의 nginx.conf 적용(nginx -t 통과), :8080 프록시 경유로 health/CRUD/404 패스스루 확인. proxy_pass 대상만 host.docker.internal로 치환해 테스트
- 2026-07-10 | 입력값 검증 계층 — validators/ 신설(필수 필드·타입·길이·ENUM), AppError + 전역 에러 핸들러 statusCode 매핑, cards PUT 부분 갱신으로 통일(tags 소실 버그 수정), 깨진 JSON→400. Docker 실환경 13개 케이스 검증 통과. 커밋 ab6e434 (2026-07-11 푸시) — **서버 컨테이너에는 아직 미반영**
- 2026-07-10 | Hostinger 서버(Ubuntu 24.04)에 앱 기동 성공 — Docker 확인, ~/ijik-api clone, .env 설정, docker compose up → Database connected successfully
- 2026-07-10 | docs/DEPLOY.md 최종본 — 서브도메인 + Certbot HTTPS 절차로 갱신 (DNS A레코드 → Nginx → 방화벽 → Certbot 순서)

## 배포 검증에서 재현된 버그 → 2026-07-10 전부 수정 완료 (미커밋)

- ~~`POST /postings status=nonsense` → 500~~ → 400 + ENUM 안내 메시지
- ~~`PUT /postings/:id` 빈 body → 404~~ → 400 "at least one field ..."
- ~~cards PUT 전체 덮어쓰기(부분 body 시 tags 소실/500)~~ → postings와 동일한 부분 갱신으로 통일, tags:null로 명시적 초기화 가능

## 프로젝트 위상 결정 (2026-07-10)

- **ijik-api = 채용 대응용 백엔드 포트폴리오.** 배포 완료 + (선택) Swagger까지만 하고 멈춤. 기능 확장 안 함
- **ijik-os = 주력.** 풀스택(Next.js) 유지, 프론트 분리 마이그레이션 안 함 (성능·비용상 손해로 결론)
- 전체 로드맵: ① ijik-api 배포 마무리 → ② ijik-os 1.5 안정화 → ③ ijik-os VPS 배포(실사용) → ④ 피드백 업그레이드 → ⑤ SaaS 전환 (ijik-os PLAN.md §4.1 트리거 따름)
- 최종 서버 그림: Nginx가 서브도메인으로 분배 — api.도메인(ijik-api) / ijik.도메인(ijik-os) / 기존 OpenClaw

## 다음 세션 진입점

**서버 상태 (Hostinger VPS, Ubuntu 24.04):**
- ~/ijik-api에 코드 있음, 컨테이너 기동 중 (app + db healthy)
- 서버 내부 curl /health 정상
- ⚠️ 검증 계층 미반영 상태 — 커밋·푸시 후 서버에서 git pull + docker compose up -d --build 필요
- ⚠️ nginx.conf의 `server_name _`는 캐치올 — OpenClaw와 같은 nginx :80 공유 시 서버 블록 매칭 주의. ijik-api 전용 server_name(서브도메인)으로 추가할 것 (DEPLOY.md 절차가 이미 서브도메인 기준)

**남은 배포 단계 (사용자가 서버에서 직접, docs/DEPLOY.md 5~9단계):**
1. Hostinger 패널에서 서브도메인 A 레코드 추가 → dig로 전파 확인
2. Nginx 서버 블록 추가 (sites-available/ijik-api)
3. 방화벽 80/443 허용
4. certbot --nginx로 HTTPS 발급
5. 최종 확인 (https health + POST created_at UTC 검증)

**로컬 환경 (Windows 11):**
- Docker Desktop 28.1.1 (수동 기동 필요), MySQL 8.0 클라이언트, Node v22.14
- `.env` 존재 (DB_HOST=db, Docker 모드) — gitignore 대상, 로컬 전용 비밀번호. 로컬 npm run dev 시 DB_HOST=localhost로 변경 필요
- `docker compose up -d` 로 앱+DB 기동 확인됨
- (참고: 이전 메모의 MariaDB/brew 환경은 macOS 머신 기준이었음)
