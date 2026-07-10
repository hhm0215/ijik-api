# RETROSPECTIVE

## 2026-07-10 | 로컬에서 우연히 맞은 타임존이 Docker(UTC)에서 9시간 밀림

**무슨 일:** `pool.js`에 `timezone: '+09:00'`을 넣고 로컬 MariaDB에서 검증했을 때는
`created_at`이 정상으로 보였다. 그러나 Docker MySQL 컨테이너(기본 TZ=UTC)에서
배포 검증하니 `created_at`이 실제보다 9시간 과거로 저장됐다.

**원인:** 로컬 MariaDB는 시스템 타임존이 KST라 `+09:00` 설정과 우연히 일치했다.
Docker MySQL은 UTC로 동작하는데 mysql2가 그 UTC 값을 "KST"로 재해석하면서
UTC로 다시 변환 → 9시간 차감. 로컬 검증만으로는 이 버그가 드러나지 않았다.

**해결:** `timezone: 'Z'`로 DB·앱 모두 UTC 통일. 저장은 UTC, 표시 시점에만 KST 변환.

**재발 방지 규칙을 박은 위치:**
- `SETUP_NOTES.md` §11 — UTC 통일 방침 + 이 사고 경위를 결정 근거로 기록
- `CLAUDE.md` "주의사항" — "시각 동작은 UTC 환경(Docker) 기준으로 검증" 규칙 추가
- 교훈 요약: **로컬에서 통과한 시각/타임존/로케일 의존 로직은 배포 환경(UTC)에서 재검증하기 전까지 신뢰하지 않는다.**
