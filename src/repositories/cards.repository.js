const { pool } = require('../db/pool');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM experience_cards WHERE deleted_at IS NULL');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM experience_cards WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return rows[0] || null;
}

async function create({ title, content, tags }) {
  const [result] = await pool.query(
    'INSERT INTO experience_cards (title, content, tags) VALUES (?, ?, ?)',
    [title, content, tags || null]
  );
  return findById(result.insertId);
}

// 부분 갱신 — 전달된 필드만 SET에 포함한다.
// undefined를 그대로 바인딩하면 mysql2가 NULL로 보간해 데이터가 소실되므로 반드시 가드할 것.
async function update(id, { title, content, tags }) {
  const fields = [];
  const values = [];

  if (title !== undefined)   { fields.push('title = ?');   values.push(title); }
  if (content !== undefined) { fields.push('content = ?'); values.push(content); }
  if (tags !== undefined)    { fields.push('tags = ?');    values.push(tags); }

  if (fields.length === 0) return 0;

  values.push(id);
  const [result] = await pool.query(
    `UPDATE experience_cards SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return result.affectedRows;
}

async function softDelete(id) {
  const [result] = await pool.query(
    'UPDATE experience_cards SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return result.affectedRows;
}

module.exports = { findAll, findById, create, update, softDelete };
