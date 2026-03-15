const { createManeuverPlan } = require('../services/planService');

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

module.exports = { createPlan };