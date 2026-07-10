const AppError = require('./AppError');

// 값이 주어졌을 때(undefined 제외) 문자열 타입과 길이를 검사한다.
// DB 제약(NOT NULL, VARCHAR 길이)에 걸리기 전에 400으로 막는 것이 목적.
function checkString(name, value, { max, nullable = false } = {}) {
  if (value === null) {
    if (!nullable) throw new AppError(400, `${name} must not be null`);
    return;
  }
  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppError(400, `${name} must be a non-empty string`);
  }
  if (max && value.length > max) {
    throw new AppError(400, `${name} must be ${max} characters or less`);
  }
}

module.exports = { checkString };
