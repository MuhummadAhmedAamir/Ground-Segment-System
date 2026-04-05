const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { createPlan, listPendingPlansForSatellite } = require('../controllers/planController');

router.get(
  '/pending/satellite/:sat_id',
  authenticate,
  requireRole('MISSION_ENGINEER'),
  listPendingPlansForSatellite
);
router.post('/', authenticate, requireRole('MISSION_ENGINEER'), createPlan);

module.exports = router;
