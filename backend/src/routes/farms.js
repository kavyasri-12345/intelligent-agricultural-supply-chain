const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const authenticateJWT = require('../middleware/auth');
const permit = require('../middleware/rbac');

router.get('/', farmController.listFarms);
router.get('/clusters', farmController.getFarmClusters);
router.get('/network', farmController.getFarmNetwork);
router.post('/', authenticateJWT, permit('ADMIN', 'FARMER', 'PLANNER'), farmController.registerFarm);

module.exports = router;
