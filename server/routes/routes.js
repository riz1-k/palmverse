const express = require('express');
const router = express.Router();
const { auth, tokenVerify } = require('../controllers/auth');
const { newBooking } = require('../controllers/booking');

router.post('/auth', auth);
router.post('/newBooking', newBooking);
router.get('/tokenVerify', tokenVerify);

module.exports = router;
