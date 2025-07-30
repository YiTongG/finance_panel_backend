

const express = require('express');
const router = express.Router();

const   transactionController= require('../controllers/transactionController');

// 定义UserInformation API端点

///api/transactions/user/45430196
router.get('/user/:UserID', transactionController.getUserStockInformation);

module.exports = router;