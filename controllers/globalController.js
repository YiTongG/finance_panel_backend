const globalModel = require('../models/globalModel'); 


exports.fetchNews = async (req, res) => {
    try {
        const data = await globalModel.fetchNews();
        res.json(data); 
    } catch (error) {
        res.status(500).json({ message: '获取指数趋势分布信息失败', error: error.message });
    }
};

exports.fetchDailyOverview = async (req, res) => {
    try {
        const data = await globalModel.fetchNews();
        res.json(data); 
    } catch (error) {
        res.status(500).json({ message: '获取指数趋势分布信息失败', error: error.message });
    }
};