# PROGRESS

## 현재 git 상태

- 브랜치: main
- 최신 커밋: (아래 timezone 수정 커밋 후 갱신)
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

## 다음 세션 진입점

**로컬 환경:**
- MariaDB 로컬 실행 중 (brew services)
- DB 유저: ijik / ijik_db 스키마 존재
- .env: DB_HOST=localhost, DB_USER=ijik

**남은 작업: BACKLOG.md 참조**

**Hostinger 서버 배포:**
- Ubuntu 24.04 VPS
- 기존 OpenClaw 설정 유지하면서 ijik-api 추가 예정
- 배포 순서: Docker 설치 → git clone → .env 설정 → docker compose up -d → Nginx 서버 블록 추가
- SSH 접속 후 진행 예정
