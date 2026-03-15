require('dotenv').config();
const pool = require('./db/pool');
const bcrypt = require('bcrypt');

(async () => {
  const hash = await bcrypt.hash('1234', 10);

  await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
    ['engineer', hash, 'MISSION_ENGINEER']
  );

  console.log('User created');
  process.exit();
})();