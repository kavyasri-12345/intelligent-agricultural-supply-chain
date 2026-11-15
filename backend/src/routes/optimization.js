const express = require('express');
const router = express.Router();
const optimizationController = require('../controllers/optimizationController');
const authenticateJWT = require('../middleware/auth');
const permit = require('../middleware/rbac');

router.get('/runs', optimizationController.listRuns);
router.post('/run', authenticateJWT, permit('ADMIN', 'PLANNER'), optimizationController.runOptimization);
router.post('/runs/:id/approve', authenticateJWT, permit('ADMIN', 'PLANNER'), optimizationController.approveOptimizationPlan);
router.get('/baselines', optimizationController.compareBaselines);

module.exports = router;
