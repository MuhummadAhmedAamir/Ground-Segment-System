const pool = require('../db/pool');

async function runObservations(satId = null) {

  let satelliteQuery = `
    SELECT sat_id, theta_deg, orbit_id
    FROM satellite_state
  `;

  if (satId) { // for debrisController
    satelliteQuery += ` WHERE sat_id = ${satId}`;
  }

  const satellites = await pool.query(satelliteQuery);
  const debris = await pool.query(`
    SELECT debris_id, theta_deg, orbit_id
    FROM space_debris_catalog
  `);
  const warnings = [];

  for (const sat of satellites.rows) {
    for (const d of debris.rows) {
      if (sat.orbit_id !== d.orbit_id) continue;
      const diff = Math.abs(sat.theta_deg - d.theta_deg);
      const distance = diff*2;

      await pool.query(`
        INSERT INTO observations (sat_id, debris_id, detection_timestamp, confidence_score)
        VALUES ($1,$2,NOW(),0.8)
      `,[sat.sat_id, d.debris_id]);

      if (distance < 10) {
        warnings.push({
          sat_id: sat.sat_id,
          debris_id: d.debris_id,
          message: "Decrease satellite velocity or collision expected"
        });
      }
    }

  }

  return warnings;
}

module.exports = {runObservations}