// controllers/indexController.js
   
const IndexModel = require('../models/indexModel'); 

//获取大盘指数
exports.getIndexes = async (req, res) => {
    try {
        const data = await IndexModel.fetchIndexes();
        res.json(data); 
    } catch (error) {
        res.status(500).json({ message: '获取指数数据失败', error: error.message });
    }
};

// The function name should match what's in the router
exports.fetchChartInfo = async (req, res) => {
    try {
        const { ticker } = req.params;
        const data = await IndexModel.fetchChartStats(ticker);
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: '获取指数详细信息失败', error: error.message });
    }
};
// The function name should match what's in the router
exports.fetchRegionTrending = async (req, res) => {
    try {
        const data = await IndexModel.getTrendingDistribution();
        res.json(data); 
    } catch (error) {
        res.status(500).json({ message: '获取指数趋势分布信息失败', error: error.message });
    }
};