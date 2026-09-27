const express = require('express');
const router = express.Router();
const { getAssets, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getAssets).post(protect, createAsset);
router.route('/:id').put(protect, updateAsset).delete(protect, deleteAsset);

module.exports = router;
