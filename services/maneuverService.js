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
    const currentOrbit = state.orbit_id;
    const targetOrbit = plan.target_orbit;
    if (currentOrbit === targetOrbit) {
      throw new Error('Satellite already in target orbit');
    }

    const thrust = plan.thrust_val;
    const velocityChange = thrust * 0.05;
    const fuelUsed = thrust * 0.8;

    if (state.fuel_level < fuelUsed) {
      await client.query(
        `INSERT INTO transaction_logs (plan_id, pre_fuel_kg, pre_altitude_km, tx_status)
         VALUES ($1, $2, $3, $4)`,
         [planId, state.fuel_level, state.orbit_id, 'FAILED']
      )
      throw new Error('Insufficient fuel');
    }

    let newVelocity;

    if(targetOrbit > currentOrbit){
      newVelocity = state.velocity_kms + velocityChange;
    }
    else {
      newVelocity = state.velocity_kms - velocityChange;
    }

    await client.query(
      `UPDATE satellite_state
      SET orbit_id = $1, velocity_kms = $2, fuel_level = fuel_level - $3, last_updated = NOW()
      WHERE sat_id = $4`,
      [targetOrbit, newVelocity, fuelUsed, plan.sat_id]
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

    await client.query(
      `INSERT INTO transaction_logs (plan_id, pre_fuel_kg, pre_altitude_km, tx_status)
       VALUES ($1, $2, $3, $4)`,
       [planId, state.fuel_level, state.orbit_id, 'SUCCESS']
    )

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