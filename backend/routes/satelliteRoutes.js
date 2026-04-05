const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { getAllSatellites, getSatelliteById, getSatellitesForEngineer } = require('../controllers/satelliteController');

router.get('/', authenticate, requireRole('GROUND_STATION_OPERATOR'), getAllSatellites);
router.get(
  '/engineer/all',
  authenticate,
  requireRole('MISSION_ENGINEER'),
  getSatellitesForEngineer
);
router.get('/:sat_id/status', authenticate, requireRole('MISSION_ENGINEER'), getSatelliteById);

module.exports = router;
