const pool = require('../db/pool');

async function getActiveSatellites(req, res) {
  try {
    const { rows } = await pool.query(
      `
      SELECT s.sat_id, s.model_name, st.fuel_level,
             st.theta_deg, st.altitude_km, st.last_updated
      FROM satellites s
      INNER JOIN satellite_state st
        ON s.sat_id = st.sat_id
      WHERE s.status = 'ACTIVE'
      `
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getActiveSatellites };