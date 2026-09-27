const express = require('express');
const router = express.Router();
const { getLiabilities, createLiability, updateLiability, deleteLiability } = require('../controllers/liabilityController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getLiabilities).post(protect, createLiability);
router.route('/:id').put(protect, updateLiability).delete(protect, deleteLiability);

module.exports = router;
