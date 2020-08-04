const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders');
const checkAuth = require('../middleware/check-auth');

router.use(checkAuth);

router.post('/add', ordersController.addOrder);

router.get('/', ordersController.getOrdersByIds);

router.get('/all', ordersController.getAllOrders);

router.patch('/:oid', ordersController.updateOrderById);

module.exports = router;
