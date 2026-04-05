const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole, requireAnyRole } = require('../middleware/rbac');
const { listGcRequests, createGcRequest, patchGcRequest } = require('../controllers/gcRequestController');

const mceOrGc = requireAnyRole(['MISSION_ENGINEER', 'GROUND_STATION_OPERATOR']);

router.get('/', authenticate, mceOrGc, listGcRequests);
router.post('/', authenticate, requireRole('MISSION_ENGINEER'), createGcRequest);
router.patch('/:id', authenticate, requireRole('GROUND_STATION_OPERATOR'), patchGcRequest);

module.exports = router;
