const pool = require('../db/pool');


async function communicationWindowOpen(req,res){
    const {dish_id, state_id, gs_id} = req.body;
    if (!dish_id || !state_id || !gs_id) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const client = await pool.connect();
    try{
        await client.query('BEGIN');

        const dishResult = await client.query('SELECT * FROM dish WHERE dish_id = $1 FOR UPDATE'
            ,[dish_id]
        )
        if (dishResult.rows.length == 0){
            throw new Error("Dish not found");
        }
        dish = dishResult.rows[0];

        const satelliteResult = await client.query('SELECT * FROM satellite_state WHERE state_id = $1 FOR UPDATE'
            ,[state_id]
        );
        if (satelliteResult.rows.length == 0){
            throw new Error("Satellite State not found");
        };
        satellite = satelliteResult.rows[0];

        const windowResult = await client.query('SELECT g.theta_deg as theta, d.elevation_angle as angle, d.max_distance as max_dist, d.is_transmitting as is_transmit FROM ground_station g JOIN dish d ON g.gs_id = d.gs_id WHERE g.gs_id = $1 AND d.dish_id = $2 FOR UPDATE'
            ,[gs_id,dish_id]
        );
        if (windowResult.rows.length == 0){
            throw new Error("No instance of Ground Station or Dish as such");
        };
        window = windowResult.rows[0];

        await client.query('INSERT INTO access_time (state_id, gs_id, start_time, end_time, date, status) VALUES ($1, $2, $3, $4, $5, $6)'
            ,[state_id, gs_id, new Date(0), new Date(0), new Date(0), 'PENDING']
        );

        if (!(window.max_dist > satellite.altitude_km)){
            throw new Error("Satellite is unreachable");
        };

        if ((window.theta % 180) == 0){
            if ((satellite.theta_deg % 180) == 1){
                throw new Error("Ground Station and Satellite are out of phase");
            }
        }
        else{
            if ((satellite.theta_deg % 180) == 0){
                throw new Error("Ground Station and Satellite are out of phase");
            }
        }

        if (!(((Math.abs(window.theta - satellite.theta_deg)) % 90) == 0)){
            throw new Error("Satellite is out of range");
        }
        difference = window.theta - satellite.theta_deg;

        var sign;
        if (difference < 0){
            sign = 1;
        }
        else if (difference > 0) {
            sign = -1;
        }
        else {
            sign = 0;
        }

        await client.query('COMMIT');
        res.json({
            open: true,
            direction: sign
        })
    } catch(err){
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally{
        client.release();
    }
}

module.exports = {communicationWindowOpen};