// controllers/stockController.js
   
const StockModel = require('../models/stockModel'); 


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

// // 获取股票趋势
// exports.getTrends = async (req, res) => {
//     try {
//         // 从路由参数中获取股票代码（如 AAPL、BABA）
//         const { symbol } = req.params;
        
//         // 验证股票代码是否存在
//         if (!symbol) {
//             return res.status(400).json({ message: '请提供股票代码（symbol）' });
//         }
        
//         // 将股票代码传递给模型层
//         const data = await StockModel.fetchTrends(symbol);
//         res.json(data);
//     } catch (error) {
//         res.status(500).json({ message: '获取趋势失败', error: error.message });
//     }
// };
// 搜索股票
exports.searchStocks = async (req, res) => {
    try {
        // 从路径参数获取query
        const { query } = req.query;  
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: '请提供搜索关键词'
            });
        }
        
        const result = await StockModel.searchStocksByFullName(query);
        return res.json(result);
    } catch (error) {
        console.error('搜索股票失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 单只股票的历史数据加详细信息
exports.searchHistoryStocks = async (req, res) => {
    try {
        // 从查询参数获取股票代码和时间间隔
        const { symbol, interval } = req.query;  
        
        // 验证参数是否存在
        if (!symbol) {
            return res.status(400).json({
                success: false,
                message: '请提供股票代码（symbol）'
            });
        }
        
        if (!interval) {
            return res.status(400).json({
                success: false,
                message: '请提供时间间隔（interval）'
            });
        }
        
        // 调用模型方法，传入股票代码和时间间隔
        const result = await StockModel.searchHistory(symbol, interval);
        return res.json(result);
    } catch (error) {
        console.error('获取股票历史数据失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};