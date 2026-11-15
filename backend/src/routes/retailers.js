const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailerController');
const authenticateJWT = require('../middleware/auth');
const permit = require('../middleware/rbac');

router.get('/', retailerController.listRetailers);
router.get('/demand-forecast', retailerController.getDemandForecast);
router.get('/orders', retailerController.listOrders);
router.post('/orders', authenticateJWT, permit('ADMIN', 'RETAILER', 'PLANNER'), retailerController.createOrder);

module.exports = router;
