# BACKLOG

## P0

- **Hostinger 서버 배포** — Docker 설치 → git clone → .env → docker compose up -d → Nginx 서버 블록 추가 → 동작 확인

## P1

- **입력값 검증 강화** — PUT 요청 시 빈 body 처리, status ENUM 외 값 방어
- **페이지네이션** — GET /cards, GET /postings 목록에 limit/offset 쿼리 파라미터 추가

## P2

- **HTTPS 설정** — Let's Encrypt + Certbot으로 SSL 인증서 발급 (도메인 있을 때)
- **cards ↔ postings 연결** — 공고에 경험 카드 매칭 관계 추가 (ijik-os 도메인 핵심 기능)
- **응답 통일** — PUT 성공 시 수정된 리소스 전체 반환 (현재 `{ success: true, data: null }`)
