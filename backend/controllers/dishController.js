const pool = require('..db/pool');

async function dishAngle(dish_id, state_id, sign){
    const client = await pool.connect();
    try {
        const dishResult = await client.query('SELECT * FROM dish WHERE dish_id = $1 FOR UPDATE'
            ,[dish_id]
        );
        if (dishResult.rows.length == 0){
            throw new Error("No instance of dish");
        }
        dish = dishResult.rows[0];

        const satelliteResult = await client.query('SELECT * FROM satellite_state WHERE state_id = $1 FOR UPDATE'
            ,[state_id, gs_id, ]
        );
        if (satelliteResult.rows.length == 0){
            throw new Error("Satellite State not found");
        };
        satellite = satelliteResult.rows[0];

        const personnelResult = await client.query('SELECT COUNT(*) FROM personnel WHERE role = Engineer AND is_working = TRUE FOR UPDATE');
        if(personnelResult.rows.length == 0){
            throw new Error('No data of Personnel');
        }
        personnel = personnelResult.rows[0];

        if (!(personnel >= 5)){
            throw new Error('NOt enough Personnel Working');
        }

        if (sign < 0){
            dish.elevation_angle += 20;
        }
        else if (sign > 0) {
            dish.elevation_angle -= 20;
        }

        await client.query(
                `UPDATE dish
                SET elevation_angle = $1
                WHERE dish_id = $2`,[dish.elevation_angle, dish_id]
        );

        return {
            success: 'True'
        }
    } catch (err){

    }
}