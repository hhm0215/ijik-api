const express = require('express');
const router = require('./routes');

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
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

module.exports = app;
