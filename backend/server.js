require('dotenv').config();
const express = require('express');

const { startUniverse } = require('./simulation/universe');
const authRoutes = require('./routes/authRoutes');
const missionRoutes = require('./routes/missionRoutes');
const satelliteRoutes = require('./routes/satelliteRoutes');
const maneuverRoutes = require('./routes/maneuverRoutes');
const planRoute = require('./routes/planRoute'); 
const debrisRoute = require('./routes/debrisRoute');
const windowRoutes = require('./routes/windowRoutes');
const groundRoutes = require('./routes/groundRoutes');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/missions', missionRoutes);
app.use('/satellite', satelliteRoutes);
app.use('/maneuver', maneuverRoutes);
app.use('/plan', planRoute); 
app.use('/debris', debrisRoute);
app.use('/window', windowRoutes);
app.use('/ground', groundRoutes);

app.get('/', (req, res) => {
  res.send('Backend running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  startUniverse();
});