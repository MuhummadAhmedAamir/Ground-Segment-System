const pool = require('../db/pool');
const { createManeuverPlan } = require('../services/planService');

async function listPendingPlansForSatellite(req, res) {
  try {
    const { sat_id } = req.params;
    const { rows } = await pool.query(
      `SELECT plan_id, sat_id, target_orbit, thrust_val, approval_status, execution_time
       FROM maneuver_plans
       WHERE sat_id = $1 AND UPPER(TRIM(approval_status)) = 'PENDING'
       ORDER BY plan_id`,
      [sat_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createPlan(req, res) {
  try {
    const { sat_id, target_orbit, thrust_value } = req.body;
    if (!sat_id || !target_orbit || !thrust_value) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const plan = await createManeuverPlan(
      sat_id,
      target_orbit,
      thrust_value
    );

    res.json({
      message: "Maneuver plan created",
      plan_id: plan.plan_id
    });

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
}

module.exports = { createPlan, listPendingPlansForSatellite };