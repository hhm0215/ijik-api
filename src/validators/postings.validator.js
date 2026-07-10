const AppError = require('../utils/AppError');
const { checkString } = require('../utils/validate');

// 스키마 제약: company VARCHAR(100) NOT NULL, title VARCHAR(200) NOT NULL,
//              url VARCHAR(500) NULL, status ENUM('open','applied','closed')
const STATUSES = ['open', 'applied', 'closed'];

function checkStatus(status) {
  if (!STATUSES.includes(status)) {
    throw new AppError(400, `status must be one of: ${STATUSES.join(', ')}`);
  }
}

function validateCreate(body) {
  const { company, title, url, status } = body;
  if (company === undefined || title === undefined) {
    throw new AppError(400, 'company and title are required');
  }
  checkString('company', company, { max: 100 });
  checkString('title', title, { max: 200 });
  if (url !== undefined) checkString('url', url, { max: 500, nullable: true });
  if (status !== undefined) checkStatus(status);
  return { company, title, url, status };
}

function validateUpdate(body) {
  const { company, title, url, status } = body;
  if (company === undefined && title === undefined && url === undefined && status === undefined) {
    throw new AppError(400, 'at least one field (company, title, url, status) is required');
  }
  if (company !== undefined) checkString('company', company, { max: 100 });
  if (title !== undefined) checkString('title', title, { max: 200 });
  if (url !== undefined) checkString('url', url, { max: 500, nullable: true });
  if (status !== undefined) checkStatus(status);
  return { company, title, url, status };
}

module.exports = { validateCreate, validateUpdate };
