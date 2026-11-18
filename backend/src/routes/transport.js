const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const authenticateJWT = require('../middleware/auth');
const permit = require('../middleware/rbac');

router.get('/vehicles', transportController.listVehicles);
router.get('/fleet', transportController.listVehicles);
router.patch('/vehicles/:id/status', authenticateJWT, permit('ADMIN', 'TRANSPORT_MANAGER', 'PLANNER'), transportController.updateVehicleStatus);

module.exports = router;
