const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { createMission, addSatelliteToMission } = require('../controllers/missionController');

router.post('/', authenticate, requireRole('MISSION_ENGINEER'), createMission);
router.post('/:mission_id/satellites', authenticate, requireRole('MISSION_ENGINEER'), addSatelliteToMission);

module.exports = router; 