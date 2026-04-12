const pool = require('../db/pool');

async function evaluateAlignment(client, dish_id, state_id, gs_id) {
  const dishResult = await client.query('SELECT * FROM dish WHERE dish_id = $1', [dish_id]);
  if (dishResult.rows.length === 0) {
    return { ok: false, error: 'Dish not found' };
  }

  const satelliteResult = await client.query('SELECT * FROM satellite_state WHERE state_id = $1', [
    state_id,
  ]);
  if (satelliteResult.rows.length === 0) {
    return { ok: false, error: 'Satellite State not found' };
  }
  const satellite = satelliteResult.rows[0];

  const windowResult = await client.query(
    `SELECT g.theta_deg as theta, d.elevation_angle as angle, d.max_distance as max_dist, d.is_transmitting as is_transmit
     FROM ground_station g
     JOIN dish d ON g.gs_id = d.gs_id
     WHERE g.gs_id = $1 AND d.dish_id = $2`,
    [gs_id, dish_id]
  );
  if (windowResult.rows.length === 0) {
    return { ok: false, error: 'No instance of Ground Station or Dish as such' };
  }
  const window = windowResult.rows[0];

  if (!(window.max_dist > satellite.altitude_km)) {
    return { ok: false, error: 'Satellite is unreachable' };
  }

  if (window.theta < 180) {
    if (satellite.theta_deg > 180) {
      return { ok: false, error: 'Ground Station and Satellite are out of phase' };
    }
  } else if (satellite.theta_deg < 180) {
    return { ok: false, error: 'Ground Station and Satellite are out of phase' };
  }

  if (!(Math.abs(window.theta - satellite.theta_deg) < 90)) {
    return { ok: false, error: `Satellite is out of range ${window.theta} and ${satellite.theta_deg}` };
  }

  const difference = window.theta - satellite.theta_deg;
  let sign;
  if (difference < 0) sign = 1;
  else if (difference > 0) sign = -1;
  else sign = 0;

  return { ok: true, direction: sign };
}

async function checkCommunicationWindow(req, res) {
  const { dish_id, state_id, gs_id } = req.body;
  if (!dish_id || !state_id || !gs_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    const result = await evaluateAlignment(client, dish_id, state_id, gs_id);
    if (!result.ok) {
      return res.json({ open: false, error: result.error });
    }
    res.json({ open: true, direction: result.direction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

async function communicationWindowOpen(req, res) {
  const { dish_id, state_id, gs_id } = req.body;
  if (!dish_id || !state_id || !gs_id) {
    return res.status(400).json({
      error: 'Missing required fields',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const dishResult = await client.query('SELECT * FROM dish WHERE dish_id = $1 FOR UPDATE', [dish_id]);
    if (dishResult.rows.length === 0) {
      throw new Error('Dish not found');
    }

    const satelliteResult = await client.query(
      'SELECT * FROM satellite_state WHERE state_id = $1 FOR UPDATE',
      [state_id]
    );
    if (satelliteResult.rows.length === 0) {
      throw new Error('Satellite State not found');
    }
    const satellite = satelliteResult.rows[0];

    const windowResult = await client.query(
      `SELECT g.theta_deg as theta, d.elevation_angle as angle, d.max_distance as max_dist, d.is_transmitting as is_transmit
       FROM ground_station g
       JOIN dish d ON g.gs_id = d.gs_id
       WHERE g.gs_id = $1 AND d.dish_id = $2
       FOR UPDATE`,
      [gs_id, dish_id]
    );
    if (windowResult.rows.length === 0) {
      throw new Error('No instance of Ground Station or Dish as such');
    }
    const window = windowResult.rows[0];

    if (!(window.max_dist > satellite.altitude_km)) {
      throw new Error('Satellite is unreachable');
    }

    if (window.theta < 180) {
      if (window.theta > 180) {
        throw new Error('Ground Station and Satellite are out of phase');
      }
    } else if (satellite.theta_deg < 180) {
      throw new Error('Ground Station and Satellite are out of phase');
    }

    if (!(Math.abs(window.theta - satellite.theta_deg) < 90)) {
      throw new Error('Satellite is out of range');
    }


    const difference = window.theta - satellite.theta_deg;
    let sign;
    if (difference < 0) {
      sign = 1;
    } else if (difference > 0) {
      sign = -1;
    } else {
      sign = 0;
    }

    const insertResult = await client.query(
      `INSERT INTO access_time (state_id, gs_id, start_time, end_time, date, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING access_id`,
      [state_id, gs_id, new Date(0), new Date(0), new Date(0), 'PENDING']
    );

    await client.query('COMMIT');
    res.json({
      open: true,
      direction: sign,
      access_id: insertResult.rows[0].access_id,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

module.exports = { communicationWindowOpen, checkCommunicationWindow };
