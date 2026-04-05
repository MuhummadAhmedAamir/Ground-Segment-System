const pool = require('../db/pool');

/**
 * Compare satellites to debris catalog. Optionally filter to one satellite.
 * Returns { observations, warnings } for API; universe tick ignores the return value.
 */
async function runObservations(satId = null) {
  let satellites;
  if (satId != null && satId !== '') {
    satellites = await pool.query(
      `SELECT sat_id, theta_deg, orbit_id FROM satellite_state WHERE sat_id = $1`,
      [satId]
    );
  } else {
    satellites = await pool.query(`SELECT sat_id, theta_deg, orbit_id FROM satellite_state`);
  }

  const debris = await pool.query(
    `SELECT debris_id, theta_deg, orbit_id, danger_radius_km FROM space_debris_catalog`
  );

  const observations = [];
  const warnings = [];

  for (const sat of satellites.rows) {
    for (const d of debris.rows) {
      if (Number(sat.orbit_id) !== Number(d.orbit_id)) continue;

      const diff = Math.abs(Number(sat.theta_deg) - Number(d.theta_deg));
      const distanceMetric = diff * 2;

      try {
        await pool.query(
          `INSERT INTO observations (sat_id, debris_id, detection_timestamp, confidence_score)
           VALUES ($1, $2, NOW(), 0.8)`,
          [sat.sat_id, d.debris_id]
        );
      } catch (e) {
        /* ignore duplicate / constraint issues during simulation ticks */
      }

      observations.push({
        sat_id: sat.sat_id,
        debris_id: d.debris_id,
        orbit_id: sat.orbit_id,
        sat_theta_deg: sat.theta_deg,
        debris_theta_deg: d.theta_deg,
        angular_separation_deg: diff,
        distance_metric: distanceMetric,
        danger_radius_km: d.danger_radius_km,
        debris_risk_level: d.risk_level ?? null,
      });

      if (distanceMetric < 10) {
        warnings.push({
          sat_id: sat.sat_id,
          debris_id: d.debris_id,
          message: 'Decrease satellite velocity or collision expected',
        });
      }
    }
  }

  return { observations, warnings };
}

module.exports = { runObservations };
