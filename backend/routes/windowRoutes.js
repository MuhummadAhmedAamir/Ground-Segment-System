const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireAnyRole } = require('../middleware/rbac');
const { communicationWindowOpen, checkCommunicationWindow } = require('../controllers/windowController');
const { dishAngle, BeginDishTransmission, EndDishTransmission } = require('../controllers/dishController');

const engineerOrGC = requireAnyRole(['MISSION_ENGINEER', 'GROUND_STATION_OPERATOR']);

router.post('/check', authenticate, engineerOrGC, checkCommunicationWindow);
router.post('/', authenticate, engineerOrGC, communicationWindowOpen);
router.post('/dish', authenticate, engineerOrGC, dishAngle);
router.post('/begin', authenticate, engineerOrGC, BeginDishTransmission);
router.post('/end', authenticate, engineerOrGC, EndDishTransmission);

module.exports = router;
