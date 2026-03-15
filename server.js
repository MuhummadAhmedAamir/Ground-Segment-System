require('dotenv').config();
const express = require('express');

const authRoutes = require('./backend/routes/authRoutes');
const missionRoutes = require('./backend/routes/missionRoutes');
const satelliteRoutes = require('./backend/routes/satelliteRoutes');
const maneuverRoutes = require('./backend/routes/maneuverRoutes');
const planRoute = require('./backend/routes/planRoute'); // if exists

const app = express();

app.use(express.json());

console.log(process.env.DATABASE_URL);

app.use('/auth', authRoutes);
app.use('/missions', missionRoutes);
app.use('/satellite', satelliteRoutes);
app.use('/maneuver', maneuverRoutes);
app.use('/plan', planRoute); 

app.get('/', (req, res) => {
  res.send('Backend running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});