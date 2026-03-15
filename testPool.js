require('dotenv').config();
const pool = require('./pool');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to DB! Current time:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
})();