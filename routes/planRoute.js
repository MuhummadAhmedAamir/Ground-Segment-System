const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { createPlan } = require('../controllers/planController');
const { approvePlan } = require('../controllers/planController'); // to be implemented

router.post('/', authenticate, requireRole('MISSION_ENGINEER'), createPlan);
// router.patch('/:plan_id/approve', authenticate, requireRole('GSO'), approvePlan);

module.exports = router;