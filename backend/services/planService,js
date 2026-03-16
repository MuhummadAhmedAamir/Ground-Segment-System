const pool = require('../db/pool');

async function createManeuverPlan(satId, targetOrbit, thrustValue) {

  const result = await pool.query(
    `INSERT INTO maneuver_plans (sat_id, target_orbit, thrust_val, approval_status, execution_time)
     VALUES ($1,$2,$3,'PENDING',NULL)
     RETURNING plan_id`,
    [
      satId, targetOrbit, thrustValue
    ]
  );

  return result.rows[0];
}

module.exports = { createManeuverPlan };