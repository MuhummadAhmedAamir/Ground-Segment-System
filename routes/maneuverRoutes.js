const express = require('express')
const router = express.Router()

const { authenticate } = require('../middleware/auth')
const { requireRole } = require('../middleware/rbac')
const { runManeuver } = require('../controllers/maneuverController')

router.post('/:plan_id/execute', authenticate, requireRole('MISSION_ENGINEER'), runManeuver)
module.exports = router;
