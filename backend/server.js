const express = require('express');
const supabase = require('./supabaseClient');
const app = express();
const PORT = 3000;

app.use(express.json());

// Get all active satellites for the dashboard
app.get('/api/satellites/status', async (req, res) => {
    const {data, error} = await supabase.from('satellite_state').select('sat_id, theta_deg, altitude_km, last_updated, satellites(status, model_name)').eq('satellites.status', 'ACTIVE');

    if(error) return res.status(500).json({error: error.message});
    res.json(data);
});

// Get latest eclipse alert
app.get('/api/alerts/eclipse', async (req, res) => {
    const {data, error} = await supabase.from('telemetry_logs').select('*').eq('is_eclipse', true).order('log_timestamp', { ascending:true}).limit(10);

    if(error) return res.status(500).json({error : error.message});
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});