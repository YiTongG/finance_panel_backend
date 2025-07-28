// controllers/stockController.js
   
const StockModel = require('../models/stockModel'); 

// 获取大盘指数
exports.getIndexes = async (req, res) => {
    try {
        const data = await StockModel.fetchIndexes();
        res.json(data); 
    } catch (error) {
        res.status(500).json({ message: '获取指数数据失败', error: error.message });
    }
};

// 获取热门股票
exports.getHotStocks = async (req, res) => {
    try {
        const { sortBy } = req.query; // 从请求的query参数中获取sortBy
        const data = await StockModel.fetchHotStocks(sortBy);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: '获取热门股票数据失败', error: error.message });
    }
};

// 获取股票趋势
exports.getTrends = async (req, res) => {
    try {
        const data = await StockModel.fetchTrends();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: '获取趋势失败', error: error.message });
    }
};

// 搜索股票
exports.searchStocks = async (req, res) => {
    try {
        const { q } = req.query; // 获取搜索词
        if (!q) {
            return res.status(400).json({ message: '搜索关键词不能为空' });
        }
        const data = await StockModel.searchStocks(q);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: '搜索股票失败', error: error.message });
    }
};