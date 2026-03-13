const { executeManeuver } = require('../services/maneuverService');

async function runManeuver(req, res) {
  try {
    const planId = req.params.plan_id;
    const engineerId = req.user.id;
    const result = await executeManeuver(planId, engineerId);

    res.json({
      message: "Maneuver executed",
      result
    });

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
}

module.exports = { runManeuver };