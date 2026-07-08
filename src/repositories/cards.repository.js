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

async function update(id, { title, content, tags }) {
  const [result] = await pool.query(
    'UPDATE experience_cards SET title = ?, content = ?, tags = ? WHERE id = ? AND deleted_at IS NULL',
    [title, content, tags || null, id]
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
