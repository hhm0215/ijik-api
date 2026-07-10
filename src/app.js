const express = require('express');
const router = require('./routes');
const AppError = require('./utils/AppError');

const app = express();

// 요청 바디 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 라우터
app.use('/api/v1', router);

// 404 핸들러 — 등록된 라우트에 매칭되지 않으면 여기로 떨어짐
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// 전역 에러 핸들러 — 인자 4개(err, req, res, next)가 반드시 있어야 Express가 에러 미들웨어로 인식함
app.use((err, _req, res, _next) => {
  // 의도된 도메인 에러(404, 400 등)는 해당 statusCode로 응답
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }
  // express.json()의 JSON 파싱 실패는 클라이언트 잘못이므로 400
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

module.exports = app;
