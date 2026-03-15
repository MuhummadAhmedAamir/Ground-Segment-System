const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { getSatelliteById } = require('../controllers/satelliteController');

router.get('/:sat_id/status', authenticate, requireRole('MISSION_ENGINEER'),getSatelliteById);

module.exports = router;