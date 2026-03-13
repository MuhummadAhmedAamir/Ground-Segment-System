const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { getActiveSatellites } = require('../controllers/satelliteController');

router.get(
  '/status',
  authenticate,
  requireRole('MISSION_ENGINEER'),
  getActiveSatellites
);

module.exports = router;