const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { listDishes } = require('../controllers/groundController');

router.get('/dishes', authenticate, requireRole('GROUND_STATION_OPERATOR'), listDishes);

module.exports = router;
