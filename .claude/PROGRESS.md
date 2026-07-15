# PROGRESS

## 현재 git 상태

- 브랜치: main
- 최신 커밋: `git log -1 --oneline`으로 확인 (문서에 SHA를 고정하지 않음)
- 원격: origin/main 동기화 완료
- GitHub: https://github.com/hhm0215/ijik-api
- 미커밋 변경: `git status --short`로 확인
- 서버 컨테이너: 검증 계층·Traefik 라우팅 반영 완료 (2026-07-14 실측)

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
- 2026-07-10 | 입력값 검증 계층 — validators/ 신설(필수 필드·타입·길이·ENUM), AppError + 전역 에러 핸들러 statusCode 매핑, cards PUT 부분 갱신으로 통일(tags 소실 버그 수정), 깨진 JSON→400. Docker 실환경 13개 케이스 검증 통과. 커밋 ab6e434 (2026-07-11 푸시, 2026-07-14 서버 반영 완료)
- 2026-07-10 | Hostinger 서버(Ubuntu 24.04)에 앱 기동 성공 — Docker 확인, ~/ijik-api clone, .env 설정, docker compose up → Database connected successfully
- 2026-07-10 | docs/DEPLOY.md 최종본 — 서브도메인 + Certbot HTTPS 절차로 갱신 (DNS A레코드 → Nginx → 방화벽 → Certbot 순서)
- 2026-07-14 | **배포 완료 — https://api.srv1519092.hstgr.cloud 가동.** 서버 실측(ss -tlnp)으로 Nginx 미설치 + Traefik(OpenClaw 스택)이 80/443 선점 확인 → Nginx 설치 대신 기존 Traefik에 docker-compose 라벨로 라우트 추가 (PUBLIC_HOST 환경변수 주입, 커밋 fc48b42). HTTPS는 Traefik 내장 letsencrypt 리졸버 자동 발급. 최종 검증: 인증서 검증 통과, HTTP→HTTPS 308, POST created_at=UTC 일치, 검증 계층 400 동작, soft delete. 와일드카드 DNS(*.srv...hstgr.cloud) 덕에 A레코드 불필요였음
- 2026-07-14 | ⚠️ 보안 발견: 호스트 Ollama가 `*:11434`로 인터넷에 개방 (외부 접근 실측됨) → BACKLOG P0
- 2026-07-15 | Swagger UI 완결 — 기존 `docs/openapi.yaml`을 정본으로 `/api-docs`, `/api-docs.json` 제공. 상대 서버 URL로 로컬·배포 Try it out 지원, Docker 이미지에 스펙 포함, OpenAPI 계약 테스트 추가. 테스트 5건·lint·실제 HTTP 200 검증 통과. 서버에는 다음 재배포 시 반영
- 2026-07-15 | 두 저장소 운영 규칙 정렬 — 비어 있던 SessionStart 훅을 origin/main 최신성 검사로 활성화하고, 현재 Traefik 배포 구조·독립 포트폴리오 기능 동결·로컬 품질 게이트·검증된 작업 단위의 문서/커밋/푸시 규칙을 CLAUDE/README/settings에 반영

## 배포 검증에서 재현된 버그 → 2026-07-14 수정·배포 완료

- ~~`POST /postings status=nonsense` → 500~~ → 400 + ENUM 안내 메시지
- ~~`PUT /postings/:id` 빈 body → 404~~ → 400 "at least one field ..."
- ~~cards PUT 전체 덮어쓰기(부분 body 시 tags 소실/500)~~ → postings와 동일한 부분 갱신으로 통일, tags:null로 명시적 초기화 가능

## 프로젝트 위상 결정 (2026-07-10)

- **ijik-api = 채용 대응용 백엔드 포트폴리오.** 배포 + Swagger 완료. 신규 도메인 기능은 확장하지 않고 테스트·보안·운영 하드닝만 필요 시 진행
- **ijik-os = 주력.** 풀스택(Next.js) 유지, 프론트 분리 마이그레이션 안 함 (성능·비용상 손해로 결론)
- **저장소 경계:** 두 프로젝트는 연동하지 않는다. ijik-api의 API·MySQL을 ijik-os에
  붙이거나, ijik-os의 API·SQLite·LLM 파이프라인을 이 저장소로 옮기지 않는다.
  구조 통합은 사용자가 명시적으로 제품 아키텍처 전환을 결정할 때만 검토한다.
- 전체 로드맵: ① ijik-api 배포 마무리 → ② ijik-os 1.5 안정화 → ③ ijik-os VPS 배포(실사용) → ④ 피드백 업그레이드 → ⑤ SaaS 전환 (ijik-os PLAN.md §4.1 트리거 따름)
- 최종 서버 그림: 기존 Traefik이 서브도메인으로 분배 — api 호스트(ijik-api) / ijik 호스트(ijik-os 예정) / 기존 OpenClaw

## 다음 세션 진입점

**서버 상태 (Hostinger VPS, Ubuntu 24.04):**
- ~/ijik-api에 코드 있음, 컨테이너 기동 중 (app + db healthy)
- `https://api.srv1519092.hstgr.cloud` HTTPS·검증 계층·UTC 정상
- 앞단은 Nginx가 아니라 기존 Traefik이며 compose 라벨로 연결됨
- Swagger 커밋 푸시 후 서버에서 `git pull && docker compose up -d --build`해야 `/api-docs`가 공개 주소에 반영됨
- ⚠️ 호스트 Ollama `11434` 외부 노출은 별도 VPS P0. OpenClaw 호출 경로 진단 후 차단

**저장소 다음 작업:**
- Swagger까지 포트폴리오 완결선 도달. 신규 기능 확장 중지
- 필요 시 repository 목 기반 CRUD 통합 테스트, helmet/cors/rate-limit, Dockerfile 하드닝 순으로 진행

**로컬 환경 (Windows 11):**
- Docker Desktop 28.1.1 (수동 기동 필요), MySQL 8.0 클라이언트, Node v22.14
- `.env` 존재 (DB_HOST=db, Docker 모드) — gitignore 대상, 로컬 전용 비밀번호. 로컬 npm run dev 시 DB_HOST=localhost로 변경 필요
- `docker compose up -d` 로 앱+DB 기동 확인됨
- (참고: 이전 메모의 MariaDB/brew 환경은 macOS 머신 기준이었음)
