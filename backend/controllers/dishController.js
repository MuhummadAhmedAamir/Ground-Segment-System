const pool = require('../db/pool');

async function dishAngle(req, res){
    const {dish_id, state_id, sign} = req.body;
    if (!dish_id || !state_id || !sign) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const client = await pool.connect();
    try {
        const dishResult = await client.query('SELECT * FROM dish WHERE dish_id = $1 FOR UPDATE'
            ,[dish_id]
        );
        if (dishResult.rows.length == 0){
            throw new Error("No instance of dish");
        }
        dish = dishResult.rows[0];

        const satelliteResult = await client.query('SELECT * FROM satellite_state WHERE state_id = $1'
            ,[state_id]
        );
        if (satelliteResult.rows.length == 0){
            throw new Error("Satellite State not found");
        };
        satellite = satelliteResult.rows[0];

        const personnelResult = await client.query('SELECT COUNT(*) FROM personnel WHERE role = \'Engineer\' AND is_working = TRUE');
        if(personnelResult.rows.length == 0){
            throw new Error('No data of Personnel');
        }
        personnel = personnelResult.rows[0];
        console.log(personnel)

        if (!(personnel.count >= 5)){
            throw new Error('NOt enough Personnel Working');
        }

        if (sign < 0){
            dish.elevation_angle += 20;
        }
        else if (sign > 0) {
            dish.elevation_angle -= 20;
        }

        await client.query(`UPDATE dish SET elevation_angle = $1 WHERE dish_id = $2`
            ,[dish.elevation_angle, dish_id]
        );

        await client.query('COMMIT');
        res.json({
            success: 'True'
        })
    } catch(err){
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally{
        client.release();
    }
}

async function BeginDishTransmission(req,res){
    const {access_id} = req.body;

    try{
        await pool.query('UPDATE access_time SET start_time = $1, status = $2 WHERE access_id = $3'
            ,[new Date(), 'IN PROGRESS', access_id]
        );

        res.json({
            transmission: 'BEGUN'
        })
    } catch (err){
        res.status(500).json({ error: err.message });
    }
}

async function EndDishTransmission(req,res){
    const {access_id} = req.body;

    try{
        await pool.query('UPDATE access_time SET end_time = $1, status = $2 WHERE access_id = $3'
            ,[new Date(), 'COMPLETED', access_id]
        );

        res.json({
            transmission: 'COMPLETION'
        })
    } catch (err){
        res.status(500).json({ error: err.message });
    }
}

module.exports = {dishAngle, BeginDishTransmission, EndDishTransmission};