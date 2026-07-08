const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  waitForConnections: true,
  timezone: '+09:00',
});

// 서버 시작 시 DB 연결 가능 여부를 즉시 검증한다.
// pool.query()는 연결이 실패해도 에러를 던지지 않고 지연시키기 때문에
// 명시적으로 커넥션을 하나 빌려 ping을 날린다.
async function checkConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.ping();
    console.log('Database connected successfully.');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, checkConnection };
