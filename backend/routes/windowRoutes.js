const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { communicationWindowOpen } = require('../controllers/windowController');
const { dishAngle, BeginDishTransmission, EndDishTransmission } = require('../controllers/dishController');

router.post('/', authenticate, requireRole('GROUND_STATION_OPERATOR'), communicationWindowOpen);
router.post('/dish', authenticate, requireRole('GROUND_STATION_OPERATOR'), dishAngle);
router.post('/begin', authenticate, requireRole('GROUND_STATION_OPERATOR'), BeginDishTransmission);
router.post('/end', authenticate, requireRole('GROUND_STATION_OPERATOR'), EndDishTransmission);

module.exports = router; 