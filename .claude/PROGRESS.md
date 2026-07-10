# PROGRESS

## 현재 git 상태

- 브랜치: main
- 최신 커밋: 1a95778 — fix: unify timezone to UTC
- 원격: origin/main 동기화 완료
- GitHub: https://github.com/hhm0215/ijik-api

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
- 2026-07-10 | Docker Compose 로컬 배포 검증 (app + MySQL 8.0, schema 자동적용, CRUD 전체 통과)
- 2026-07-10 | 타임존 9시간 오차 버그 수정 (pool.js timezone '+09:00' → 'Z' UTC 통일). Docker MySQL(UTC)과 어긋나던 문제. 재검증 완료 (created_at = 서버 UTC 일치)
- 2026-07-10 | Hostinger 서버(Ubuntu 24.04)에 앱 기동 성공 — Docker 확인, ~/ijik-api clone, .env 설정, docker compose up → Database connected successfully
- 2026-07-10 | docs/DEPLOY.md 최종본 — 서브도메인 + Certbot HTTPS 절차로 갱신 (DNS A레코드 → Nginx → 방화벽 → Certbot 순서)

## 프로젝트 위상 결정 (2026-07-10)

- **ijik-api = 채용 대응용 백엔드 포트폴리오.** 배포 완료 + (선택) Swagger까지만 하고 멈춤. 기능 확장 안 함
- **ijik-os = 주력.** 풀스택(Next.js) 유지, 프론트 분리 마이그레이션 안 함 (성능·비용상 손해로 결론)
- 전체 로드맵: ① ijik-api 배포 마무리 → ② ijik-os 1.5 안정화 → ③ ijik-os VPS 배포(실사용) → ④ 피드백 업그레이드 → ⑤ SaaS 전환 (ijik-os PLAN.md §4.1 트리거 따름)
- 최종 서버 그림: Nginx가 서브도메인으로 분배 — api.도메인(ijik-api) / ijik.도메인(ijik-os) / 기존 OpenClaw

## 다음 세션 진입점

**서버 상태 (Hostinger VPS):**
- ~/ijik-api에 코드 있음, 컨테이너 기동 중 (app + db healthy)
- 서버 내부 curl /health 정상

**남은 배포 단계 (사용자가 서버에서 직접, docs/DEPLOY.md 5~9단계):**
1. Hostinger 패널에서 서브도메인 A 레코드 추가 → dig로 전파 확인
2. Nginx 서버 블록 추가 (sites-available/ijik-api)
3. 방화벽 80/443 허용
4. certbot --nginx로 HTTPS 발급
5. 최종 확인 (https health + POST created_at UTC 검증)

**로컬 환경:**
- .env는 Docker 모드(DB_HOST=db). 로컬 npm run dev 시 DB_HOST=localhost로 변경 필요
- 로컬 MariaDB에 ijik 유저 / ijik_db 존재
