const { runObservations } = require('../simulation/observationEngine');

async function checkDebris(req, res) {
  try {
    const satId = req.params.sat_id;
    const result = await runObservations(satId);

    res.json({
      message: 'Debris observation executed',
      observations: result.observations,
      warnings: result.warnings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { checkDebris };