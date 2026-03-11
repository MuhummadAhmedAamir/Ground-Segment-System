const supabase = require('./supabaseClient');

async function propagate() {
    const { data: satellites } = await supabase.from('satellite_state').select('sat_id, theta_deg, altitude_km, satellites!inner(status)').eq('satellites.status', 'ACTIVE');

    for(let satellite of satellites) {
        let newTheta = (satellite.theta_deg + 25) % 360;
        let isEclipse = (newTheta > 180 && newTheta < 360);

        await supabase.from('satellite_state').update({
            theta_deg: newTheta,
            last_updated: new Date().toISOString()
        }).eq('sat_id',satellite.sat_id);

        await supabase.from('telemetry_logs').insert({
            sat_id: satellite.sat_id,
            is_eclipse: isEclipse,
            val: Math.random() * 100, // simulating a sensor reading, will look into it later if it requires a more tailored value for simulation to run
            log_timestamp: new Date().toISOString()
        });
    }
}

setInterval(propagate, 5000); 