// routes/stocksRoutes.js

const express = require('express'); 
const router = express.Router();
const stockController = require('../controllers/stockController');

// 定义各个API端点
// GET /api/stocks/indexes -> 获取大盘指数
router.get('/indexes', stockController.getIndexes);

// GET /api/stocks/hot -> 获取热门股票
router.get('/hot', stockController.getHotStocks);

// GET /api/stocks/getTrends -> 获取股票推荐趋势
router.get('/getTrends', stockController.getTrends);


// GET /api/stocks/search -> 搜索股票
router.get('/search', stockController.searchStocks);


module.exports = router;