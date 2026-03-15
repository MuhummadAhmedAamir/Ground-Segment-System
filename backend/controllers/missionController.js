const pool = require('../db/pool');

async function createMission(req, res) {
  try {
    const { mcc_id, mission_name, mission_goal, start_date } = req.body;

    if (!mcc_id || !mission_name || !mission_goal || !start_date) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    if (![1, 2].includes(mcc_id)) {
      return res.status(400).json({
        error: "Invalid MCC id"
      });
    }

    const result = await pool.query(
      `INSERT INTO missions (mcc_id, mission_name, mission_goal, start_date)
       VALUES ($1,$2,$3,$4)
       RETURNING mission_id`,
      [mcc_id, mission_name, mission_goal, start_date]
    );

    res.status(201).json({
      message: "Mission created successfully",
      mission_id: result.rows[0].mission_id
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}

async function addSatelliteToMission(req, res) {
  const client = await pool.connect();

  try {
    const missionId = req.params.mission_id;

    const {model_name,status,orbit_id,fuel_level,velocity} = req.body;

    await client.query('BEGIN');

    const satResult = await client.query(
      `INSERT INTO satellites
       (mission_id, model_name, status)
       VALUES ($1,$2,$3)
       RETURNING sat_id`,
      [missionId, model_name, status]
    );

    const satId = satResult.rows[0].sat_id;
    const altitude = orbit_id == 1 ? 300 :600;

    await client.query(
      `INSERT INTO satellite_state
       (sat_id, orbit_id, fuel_level, theta_deg, velocity_kms, altitude_km, last_updated)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
      [satId, orbit_id, fuel_level, 0, velocity, altitude]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: "Satellite added successfully",
      sat_id: satId
    });

  } catch (err) {

    await client.query('ROLLBACK');

    res.status(500).json({
      error: err.message
    });

  } finally {
    client.release();
  }
}

module.exports = {
  createMission,
  addSatelliteToMission
};