const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { checkDebris } = require('../controllers/debrisController');

router.post(
  '/check/:sat_id',
  authenticate,
  requireRole('MISSION_ENGINEER'),
  checkDebris
);

module.exports = router;
