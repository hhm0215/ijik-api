const assert = require('node:assert/strict');
const test = require('node:test');

const { getHealth } = require('../src/controllers/health.controller');
const cardsRepository = require('../src/repositories/cards.repository');
const cardsService = require('../src/services/cards.service');
const AppError = require('../src/utils/AppError');
const { openapiDocument } = require('../src/config/openapi');
const { validateCreate: validateCardCreate, validateUpdate: validateCardUpdate } = require('../src/validators/cards.validator');
const { validateCreate: validatePostingCreate, validateUpdate: validatePostingUpdate } = require('../src/validators/postings.validator');

test('health endpoint response has an OK status and UTC timestamp', () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
    },
  };

  getHealth({}, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, 'ok');
  assert.match(response.body.timestamp, /Z$/);
});

test('card validators preserve partial-update semantics', () => {
  assert.deepEqual(validateCardCreate({ title: '제목', content: '내용' }), {
    title: '제목', content: '내용', tags: undefined,
  });
  assert.deepEqual(validateCardUpdate({ tags: null }), {
    title: undefined, content: undefined, tags: null,
  });
  assert.throws(() => validateCardUpdate({}), /at least one field/i);
});

test('posting validators accept only supported status values', () => {
  assert.deepEqual(validatePostingCreate({ company: 'ijik', title: 'Backend' }), {
    company: 'ijik', title: 'Backend', url: undefined, status: undefined,
  });
  assert.deepEqual(validatePostingUpdate({ status: 'applied' }), {
    company: undefined, title: undefined, url: undefined, status: 'applied',
  });
  assert.throws(() => validatePostingCreate({ company: 'ijik', title: 'Backend', status: 'draft' }), /status/i);
});

test('missing cards are converted to a 404 domain error', async () => {
  const originalFindById = cardsRepository.findById;
  cardsRepository.findById = async () => null;

  try {
    await assert.rejects(cardsService.findById(999), (err) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.statusCode, 404);
      assert.equal(err.message, 'Card not found');
      return true;
    });
  } finally {
    cardsRepository.findById = originalFindById;
  }
});

test('OpenAPI document covers every public resource', () => {
  assert.equal(openapiDocument.openapi, '3.0.3');
  assert.equal(openapiDocument.servers[0].url, '/api/v1');
  assert.ok(openapiDocument.paths['/health'].get);
  assert.ok(openapiDocument.paths['/cards'].get);
  assert.ok(openapiDocument.paths['/cards'].post);
  assert.ok(openapiDocument.paths['/postings/{id}'].put);
});
