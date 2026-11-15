const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const authenticateJWT = require('../middleware/auth');
const permit = require('../middleware/rbac');

router.get('/', storageController.listFacilities);
router.patch('/:id/setpoint', authenticateJWT, permit('ADMIN', 'STORAGE_MANAGER', 'PLANNER'), storageController.updateFacilitySetpoint);

module.exports = router;
