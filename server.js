require('dotenv').config();
const express = require('express');

const maneuverRoutes = require('./routes/maneuverRoutes');
const satelliteRoutes = require('./routes/satelliteRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(express.json());

console.log(process.env.DATABASE_URL)

app.use('/maneuver', maneuverRoutes);
app.use('/satellite', satelliteRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Backend running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});