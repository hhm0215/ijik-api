# BACKLOG

## P0

- **서버 Ollama 외부 노출 차단** — `*:11434`가 인터넷에 완전 개방 (외부에서 접근 실측 확인됨). OpenClaw가 Ollama를 어떻게 호출하는지 실측 후(컨테이너→호스트 경로) OLLAMA_HOST=127.0.0.1 바인딩 또는 방화벽으로 차단. 잘못 막으면 OpenClaw 깨짐 — 진단 먼저

## P1

- **테스트 도입** — jest + supertest, repository 목킹. CRUD happy path + 400/404 케이스 (검증 계층의 안전망)
- **페이지네이션** — GET /cards, GET /postings 목록에 limit/offset 쿼리 파라미터 추가

## P2

- **cards ↔ postings 연결** — 공고에 경험 카드 매칭 관계 추가 (ijik-os 도메인 핵심 기능)
- **보안 미들웨어** — helmet, cors, rate limit
- **Dockerfile 하드닝** — `USER node`, `NODE_ENV=production`, `--only=production` → `--omit=dev`

## 참고 — 이 저장소 범위 밖

- ijik-os VPS 배포(로드맵 ③)는 **ijik-os 저장소에서 진행** — 같은 Nginx 패턴, 서브도메인 하나 추가, LLM은 VPS RAM 확인 후 Ollama vs Claude API 결정

## 완료되어 제거된 항목

- ~~Swagger API 문서~~ — 2026-07-15 완료. `/api-docs` 대화형 UI + `/api-docs.json`, OpenAPI YAML 정본, Docker 이미지 포함, 계약 테스트 추가
- ~~입력값 검증 강화~~ — 2026-07-10 완료 (validators 계층 + AppError, 13개 케이스 실환경 검증, 커밋 ab6e434)
- ~~응답 통일 (PUT 성공 시 리소스 반환)~~ — 이미 구현되어 있었음 (cards.controller.js, postings.controller.js)
- ~~로컬 .env Docker 모드 전환 테스트~~ — 2026-07-10 완료
- ~~배포 마무리~~ — 2026-07-14 완료. Nginx 대신 기존 Traefik에 라벨 방식 (서버 실측 결과 Traefik이 80/443 선점). https://api.srv1519092.hstgr.cloud 가동, Let's Encrypt 자동 발급, HTTP→HTTPS 308, UTC·검증 계층 실환경 확인
- ~~검증 계층 서버 반영~~ — 2026-07-14 배포 재빌드에 포함되어 완료 (nonsense status → 400 실측)
