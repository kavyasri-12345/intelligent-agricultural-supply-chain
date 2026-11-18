const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const authenticateJWT = require('../middleware/auth');
const permit = require('../middleware/rbac');

router.get('/', batchController.listBatches);
router.get('/active', batchController.listBatches);
router.post('/', authenticateJWT, permit('ADMIN', 'FARMER', 'STORAGE_MANAGER', 'PLANNER', 'DISTRIBUTOR'), batchController.submitHarvest);
router.post('/harvest', authenticateJWT, permit('ADMIN', 'FARMER', 'STORAGE_MANAGER', 'PLANNER', 'DISTRIBUTOR'), batchController.submitHarvest);
router.post('/explain', batchController.explainBatch);

module.exports = router;
