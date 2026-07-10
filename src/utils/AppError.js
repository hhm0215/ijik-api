// statusCode를 가진 도메인 에러 — 전역 에러 핸들러가 이 코드로 응답한다.
// 일반 Error는 500으로 처리되므로, 의도된 4xx 응답은 반드시 AppError를 던질 것.
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
