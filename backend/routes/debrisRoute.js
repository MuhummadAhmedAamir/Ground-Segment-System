const express = require('express');
const router = express.Router();
const { checkDebris } = require('../controllers/debrisController');

router.post('/check/:sat_id', checkDebris);

module.exports = router;