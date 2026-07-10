# SETUP_NOTES

초기 환경 구성에서 내린 결정들의 근거를 정리한 문서.
각 선택지 간의 트레이드오프와 이 프로젝트에서 선택한 이유를 기록한다.

---

## 1. 왜 mysql2인가 (mysql 패키지 대신)

Node.js MySQL 드라이버는 `mysql`과 `mysql2` 두 가지가 있다.

- `mysql` 패키지는 콜백 방식만 지원하고 현재 유지보수가 사실상 중단된 상태다.
- `mysql2`는 `mysql`과 API가 거의 동일하면서 Promise/async-await을 공식 지원하고,
  Prepared Statement(파라미터화 쿼리)도 내장되어 있어 SQL 인젝션 방어가 편하다.

ORM(Sequelize, TypeORM 등)을 쓰지 않은 이유는 DB 계층을 직접 제어하기 위해서다.
ORM은 추상화가 높아서 실제 실행되는 SQL과 커넥션 흐름이 감춰진다.
이 프로젝트는 규모가 작고 복잡한 관계 매핑이 없어 raw query가 더 적합하다.

---

## 2. 왜 커넥션 풀인가 (단일 커넥션 대신)

단일 커넥션 방식은 한 번에 하나의 쿼리만 실행할 수 있다.
동시 요청이 들어오면 앞 요청이 끝날 때까지 다음 요청의 쿼리가 블로킹된다.

커넥션 풀은 미리 여러 개의 커넥션을 만들어두고 요청마다 빌려준 뒤 반납받는다.
- 동시 요청을 병렬로 처리 가능
- 커넥션 생성 비용(TCP 핸드셰이크 + MySQL 인증)을 매 요청마다 치르지 않아도 됨

`connectionLimit: 10`은 최대 10개 커넥션을 동시에 유지한다는 의미다.
`waitForConnections: true`는 풀이 꽉 찼을 때 요청을 대기열에 넣는 설정이다
(false면 에러를 즉시 던진다).

Spring Boot에서는 HikariCP가 이 역할을 자동으로 해줬다.
Express에서는 직접 풀을 만들고 관리해야 한다.

---

## 3. 왜 mysql2/promise인가 (콜백 방식 대신)

`mysql2`는 두 가지 진입점을 제공한다.

```js
// 콜백 방식
const mysql = require('mysql2');

// Promise 방식
const mysql = require('mysql2/promise');
```

콜백 방식은 중첩이 깊어지면 콜백 헬이 생긴다.
`mysql2/promise`를 쓰면 `async/await`으로 쿼리를 순차적으로 읽기 쉽게 작성할 수 있다.

```js
// repository에서 이렇게 쓸 수 있다
const [rows] = await pool.query('SELECT * FROM experience_cards WHERE id = ?', [id]);
```

`pool.query()`의 반환값이 `[rows, fields]` 배열이기 때문에 구조 분해로 rows만 꺼낸다.

---

## 4. 왜 서버 시작 시 DB ping을 날리는가 (checkConnection)

`pool.query()`는 커넥션이 실패해도 내부적으로 재시도하며 에러를 지연시킨다.
DB가 없는 상태에서도 서버는 정상적으로 시작되고, 첫 요청이 들어올 때야 에러가 터진다.

`checkConnection()`으로 시작 시 명시적으로 ping을 날리면:
- DB 없이 서버가 뜨는 상황을 차단
- 에러 메시지가 시작 시점에 즉시 출력되어 원인 파악이 빠름
- `process.exit(1)`로 종료하면 PM2가 이를 감지해 재시작을 시도

---

## 5. .env 기반 환경변수 분리

DB 접속 정보(host, user, password)를 코드에 하드코딩하면:
- Git에 커밋될 경우 자격증명이 공개된다
- 개발/운영 환경마다 코드를 바꿔야 한다

`dotenv`로 `.env` 파일을 로드하고, `.env`는 `.gitignore`에 추가한다.
`.env.example`은 커밋해서 어떤 변수가 필요한지 문서화한다.

`dotenv.config()`는 `server.js` 맨 첫 줄에서 호출해야 한다.
이후에 `require`하는 모든 모듈이 `process.env.*`를 읽기 때문이다.

---

## 6. 왜 ESLint 8인가 (9 대신)

ESLint 9부터는 설정 파일 포맷이 `eslint.config.js`(flat config)로 바뀌었다.
문법이 기존 `.eslintrc.js`와 달라서 진입 장벽이 높아진다.

설정 복잡도를 낮추기 위해 v8을 사용했다. 실무 프로젝트에서는 v9 flat config를 쓰는 것이 맞다.

---

## 7. app.js 미들웨어 등록 순서가 왜 이 순서인가

```
express.json()           ← 1. 요청 바디를 먼저 파싱
express.urlencoded()     ← 2. 폼 데이터 파싱
router                   ← 3. 실제 요청 처리
404 핸들러               ← 4. 라우터에서 매칭 안 된 요청
에러 핸들러              ← 5. 에러가 넘어오면 여기서 처리
```

Express 미들웨어는 `app.use()` 등록 순서대로 실행된다(파이프라인).
바디 파싱이 라우터보다 먼저 있어야 컨트롤러에서 `req.body`를 읽을 수 있다.
에러 핸들러는 반드시 마지막에 와야 모든 라우터에서 던진 에러를 잡을 수 있다.

Spring의 Filter → Interceptor → Controller 실행 순서와 같은 개념이다.

---

## 8. 에러 핸들러 인자가 왜 4개인가

```js
// 일반 미들웨어: 인자 3개
app.use((req, res, next) => { ... });

// 에러 핸들러: 인자 반드시 4개
app.use((err, req, res, next) => { ... });
```

Express는 미들웨어를 인자 개수(`.length`)로 구분한다.
인자가 4개일 때만 에러 처리 미들웨어로 인식한다.
3개로 쓰면 일반 미들웨어로 취급되어 `next(err)`로 넘긴 에러가 여기 도달하지 않는다.

Spring의 `@ExceptionHandler`는 어노테이션으로 식별하지만,
Express는 함수 시그니처(인자 개수)로 식별한다는 차이가 있다.

---

## 9. 왜 routes와 controllers를 분리했는가

Spring Boot에서는 `@GetMapping`이 컨트롤러 클래스에 붙어 URL과 로직이 한 파일에 있다.

Express에서 분리한 이유:
- `routes/index.js` 한 파일만 보면 이 서버의 전체 API 목록이 보인다
- 컨트롤러는 "req를 받아 res를 돌려준다"는 역할만 담당해 단일 책임이 명확해진다
- 같은 컨트롤러 함수를 다른 라우트에 재사용하기 쉽다

---

## 10. 왜 Graceful Shutdown을 처리하는가

`SIGTERM`은 PM2가 프로세스를 재시작하거나 종료할 때 보내는 시그널이다.
아무 처리 없이 프로세스가 바로 죽으면, 처리 중이던 요청이 응답을 못 받고 끊긴다.

`server.close()`는 새 연결은 받지 않고 기존 요청이 끝나기를 기다린 뒤 종료한다.
이후 `process.exit(0)`으로 정상 종료 신호를 보낸다.

PM2는 exit code 0을 정상 종료, 1을 비정상으로 구분해 재시작 여부를 판단한다.

---

## 11. timezone을 'Z'(UTC)로 통일한 이유

날짜/시각은 **저장은 UTC, 표시할 때만 로컬(KST) 변환**이 원칙이다.
DB와 애플리케이션의 타임존 해석 기준이 어긋나면 시각이 통째로 밀린다.

초기에는 `timezone: '+09:00'`으로 두었는데, Docker MySQL 컨테이너의 기본
타임존은 UTC였다. MySQL이 `DEFAULT CURRENT_TIMESTAMP`로 UTC 값을 저장하면,
mysql2가 그 값을 "KST"라고 해석해 다시 UTC로 변환하면서 9시간을 빼버렸다.
(로컬 개발 환경은 시스템 타임존이 KST라 우연히 맞아 이 버그가 안 드러났다.)

`timezone: 'Z'`로 바꿔 DB·앱 모두 UTC 기준으로 통일했다.
- 저장/조회 모두 UTC로 일관 → 서버가 어느 지역에 배포돼도 값이 안 밀린다
- 응답의 `created_at`은 `...Z`(UTC) ISO 문자열로 내려간다
- KST 표시가 필요하면 클라이언트(프론트)에서 변환하거나, 조회 시 CONVERT_TZ 사용

교훈: 로컬에서 우연히 맞은 타임존은 배포 환경(UTC)에서 깨진다.
시각 관련 동작은 UTC 환경을 기준으로 검증해야 한다.
