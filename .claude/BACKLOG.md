# BACKLOG

## P0

- **배포 마무리 (서버에서 사용자 직접 실행)** — docs/DEPLOY.md 5~9단계: DNS A레코드 → Nginx 블록 → 방화벽 80/443 → Certbot HTTPS → 최종 확인. 앱 컨테이너는 이미 기동 중
- **검증 계층 커밋·푸시 후 서버 반영** — 로컬 미커밋 상태(validators/, utils/). 푸시 후 서버에서 git pull + docker compose up -d --build

## P1

- **Swagger API 문서** — swagger-ui-express + OpenAPI 스펙. API 포트폴리오의 "얼굴" 역할. 이거까지 하면 ijik-api는 완결, 이후 ijik-os로 무게중심 이동
- **테스트 도입** — jest + supertest, repository 목킹. CRUD happy path + 400/404 케이스 (검증 계층의 안전망)
- **페이지네이션** — GET /cards, GET /postings 목록에 limit/offset 쿼리 파라미터 추가

## P2

- **cards ↔ postings 연결** — 공고에 경험 카드 매칭 관계 추가 (ijik-os 도메인 핵심 기능)
- **보안 미들웨어** — helmet, cors, rate limit
- **Dockerfile 하드닝** — `USER node`, `NODE_ENV=production`, `--only=production` → `--omit=dev`

## 참고 — 이 저장소 범위 밖

- ijik-os VPS 배포(로드맵 ③)는 **ijik-os 저장소에서 진행** — 같은 Nginx 패턴, 서브도메인 하나 추가, LLM은 VPS RAM 확인 후 Ollama vs Claude API 결정

## 완료되어 제거된 항목

- ~~입력값 검증 강화~~ — 2026-07-10 완료 (validators 계층 + AppError, 13개 케이스 실환경 검증). 코드는 커밋 대기 중
- ~~응답 통일 (PUT 성공 시 리소스 반환)~~ — 이미 구현되어 있었음 (cards.controller.js, postings.controller.js)
- ~~로컬 .env Docker 모드 전환 테스트~~ — 2026-07-10 완료
