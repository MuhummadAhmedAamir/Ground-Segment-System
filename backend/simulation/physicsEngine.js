const pool = require('../db/pool');

async function updateSatellitePositions() {
  const query = `
  UPDATE satellite_state
  SET theta_deg = (theta_deg + velocity_kms) % 360, last_updated = NOW()`;
  await pool.query(query);
}

module.exports = { updateSatellitePositions };