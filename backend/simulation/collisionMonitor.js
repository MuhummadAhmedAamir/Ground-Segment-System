const pool = require('../db/pool');

async function checkCollisionRisk() {
  const result = await pool.query(`
    SELECT s.sat_id, d.debris_id, ABS(s.theta_deg - d.theta_deg) AS angular_diff, s.orbit_id
    FROM satellite_state s
    JOIN space_debris_catalog d
    ON s.orbit_id = d.orbit_id
  `);

  const warnings = [];
  for (const row of result.rows) {
    const approxRadiusKm = row.angular_diff;

    if (approxRadiusKm < 5) {
      warnings.push({
        satellite: row.sat_id,
        debris: row.debris_id,
        message: "Decrease satellite velocity immediately. Collision risk detected."
      });
    }
  }

  return warnings;
}

module.exports = { checkCollisionRisk };