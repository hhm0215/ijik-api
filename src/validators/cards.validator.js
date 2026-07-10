const AppError = require('../utils/AppError');
const { checkString } = require('../utils/validate');

// 스키마 제약: title VARCHAR(100) NOT NULL, content TEXT NOT NULL, tags VARCHAR(255) NULL

function validateCreate(body) {
  const { title, content, tags } = body;
  if (title === undefined || content === undefined) {
    throw new AppError(400, 'title and content are required');
  }
  checkString('title', title, { max: 100 });
  checkString('content', content);
  if (tags !== undefined) checkString('tags', tags, { max: 255, nullable: true });
  return { title, content, tags };
}

function validateUpdate(body) {
  const { title, content, tags } = body;
  if (title === undefined && content === undefined && tags === undefined) {
    throw new AppError(400, 'at least one field (title, content, tags) is required');
  }
  if (title !== undefined) checkString('title', title, { max: 100 });
  if (content !== undefined) checkString('content', content);
  if (tags !== undefined) checkString('tags', tags, { max: 255, nullable: true });
  return { title, content, tags };
}

module.exports = { validateCreate, validateUpdate };
