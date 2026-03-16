const pool = require('../db/pool');

async function updateDebrisPositions() {
  const query = `
  UPDATE space_debris_catalog
  SET theta_deg = (theta_deg + 2) % 360
  `;
  await pool.query(query);
}

module.exports = { updateDebrisPositions };