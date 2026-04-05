const pool = require('../db/pool');

async function listDishes(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT dish_id, gs_id, elevation_angle, max_distance, is_transmitting
       FROM dish
       ORDER BY dish_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listDishes };
