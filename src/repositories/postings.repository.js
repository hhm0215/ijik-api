const { pool } = require('../db/pool');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM job_postings ORDER BY created_at DESC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM job_postings WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ company, title, url, status }) {
  const [result] = await pool.query(
    'INSERT INTO job_postings (company, title, url, status) VALUES (?, ?, ?, ?)',
    [company, title, url || null, status || 'open']
  );
  return findById(result.insertId);
}

async function update(id, { company, title, url, status }) {
  const fields = [];
  const values = [];

  if (company !== undefined) { fields.push('company = ?'); values.push(company); }
  if (title !== undefined)   { fields.push('title = ?');   values.push(title); }
  if (url !== undefined)     { fields.push('url = ?');     values.push(url); }
  if (status !== undefined)  { fields.push('status = ?');  values.push(status); }

  if (fields.length === 0) return 0;

  values.push(id);
  const [result] = await pool.query(
    `UPDATE job_postings SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM job_postings WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = { findAll, findById, create, update, remove };
