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

        const { data: components } = await supabase.from('components').select('comp_id, part_name, subsystems!inner(sat_id, sub_type)').eq('subsystems.sat_id',satellite.sat_id);
        console.log(`Sat ${satellite.sat_id} has ${components?.length || 0} components.`);
        for (let component of components) {
            let sensorValue = Math.random()* 100;

            if(component.part_name == 'Battery' && isEclipse) {
                sensorValue = 10 + Math.random() * 5; // simulating power drop in eclipse
            }

            await supabase.from('telemetry_logs').insert({
                sat_id: satellite.sat_id,
                comp_id: component.comp_id,
                is_eclipse: isEclipse,
                val: sensorValue, 
                log_timestamp: new Date().toISOString()
            });
        }

    }
}

setInterval(propagate, 5000); 