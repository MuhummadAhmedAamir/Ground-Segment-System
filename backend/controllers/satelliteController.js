const pool = require('../db/pool');

async function getSatelliteById(req, res) {
  try {
    const { sat_id } = req.params;
    const { rows } = await pool.query(
      `
      SELECT s.sat_id, s.model_name, st.fuel_level, st.theta_deg, st.altitude_km, st.last_updated
      FROM satellites s
      JOIN satellite_state st ON s.sat_id = st.sat_id
      WHERE s.sat_id = $1
      `,
      [sat_id]
    );
    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getSatelliteById };