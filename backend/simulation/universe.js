const { updateSatellitePositions } = require('./physicsEngine');
const { updateDebrisPositions } = require('./debrisUpdater');
const { runObservations } = require('./observationEngine');
const { checkCollisionRisk } = require('./collisionMonitor');

async function universeTick() {
  await updateSatellitePositions();
  await updateDebrisPositions();
  await runObservations();
  const warnings = await checkCollisionRisk();

  if (warnings.length > 0) {
    console.log("COLLISION ALERTS:");
    console.log(warnings);
  }
}

function startUniverse() {
  setInterval(universeTick, 5000);
}

module.exports = { startUniverse };