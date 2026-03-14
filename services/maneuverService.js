const pool = require('../db/pool');

async function executeManeuver(planId, engineerId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const planResult = await client.query(
      `SELECT * FROM maneuver_plans WHERE plan_id = $1 FOR UPDATE`,
      [planId]
    );

    if (planResult.rows.length === 0) {
      throw new Error('Maneuver plan not found');
    }

    const plan = planResult.rows[0];

    if (plan.approval_status !== 'PENDING') {
      throw new Error('Plan already executed');
    }

    const stateResult = await client.query(
      `SELECT * FROM satellite_state WHERE sat_id = $1 FOR UPDATE`,
      [plan.sat_id]
    );

    if (stateResult.rows.length === 0) {
      throw new Error('Satellite state not found');
    }

    const state = stateResult.rows[0];
    const requiredFuel = plan.thrust_val;

    if (state.fuel_level < requiredFuel) {
      throw new Error('Insufficient fuel');
    }

  await client.query(
    `UPDATE satellite_state
     SET orbit_id = orbit_id + 1, fuel_level = fuel_level - $1, last_updated = NOW()
     WHERE sat_id = $2`,
    [
      requiredFuel,
      plan.sat_id
    ]
  );

    await client.query(
      `UPDATE maneuver_plans
       SET approval_status = 'COMPLETED', execution_time = NOW()
       WHERE plan_id = $1`,
      [planId]
    );

    await client.query(
      `INSERT INTO command_history (sat_id, execution_time)
       VALUES ($1, NOW())`,
      [plan.sat_id]
    );

    await client.query('COMMIT');

    return { success: true };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { executeManeuver };