const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { communicationWindowOpen } = require('../controllers/windowController');
const { dishAngle, BeginDishTransmission, EndDishTransmission } = require('../controllers/dishController');

router.post('/', authenticate, requireRole('MISSION_ENGINEER'), communicationWindowOpen);
router.post('/dish', authenticate, requireRole('MISSION_ENGINEER'), dishAngle);
router.post('/begin', authenticate, requireRole('MISSION_ENGINEER'), BeginDishTransmission);
router.post('/end', authenticate, requireRole('MISSION_ENGINEER'), EndDishTransmission);

module.exports = router; 