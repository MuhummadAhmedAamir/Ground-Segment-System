const pool = require('../db/pool');

async function updateDangerRadius() {
  const query = `
  UPDATE space_debris_catalog d
  SET danger_radius_km = (
      SELECT MIN(ABS(st.theta_deg - d.theta_deg))
      FROM satellite_state st
      WHERE st.orbit_id = d.orbit_id
  )
  `;
  await pool.query(query);
}

module.exports = { updateDangerRadius };