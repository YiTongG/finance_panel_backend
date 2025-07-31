// models/stocksModel.js

// const axios = require('axios'); // 真实情况会用axios等工具请求外部API
const db = require('../db'); // 导入你的数据库连接


  const HOT_STOCK_UNIVERSE = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', // US Tech Giants
    'BABA', 'NIO', 'PDD', 'XPEV' // Popular Chinese Stocks
];
  
// models/stocksModel.js
const axios = require('axios');
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

class StockModel {
    /**
     * 获取热门股票列表.
     * Fetches data for a predefined list of stocks and sorts them on the server.
     * @param {string} sortBy - The sorting criteria: 'volume', 'amplitude', or 'change'.
     */
    static async fetchHotStocks(sortBy = 'volume') {
        if (!HOT_STOCK_UNIVERSE || HOT_STOCK_UNIVERSE.length === 0) {
            return [];
        }

        const options = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/api/yahoo/qu/quote/${HOT_STOCK_UNIVERSE.join(',')}`,
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        try {
            // 2. Fetch data for all stocks in our universe in one call
            const response = await axios.request(options);
            const stocks = response.data.body;

            if (!Array.isArray(stocks)) {
                console.error("API did not return a body array for hot stocks:", response.data);
                throw new Error("获取热门股票数据格式不正确。");
            }

            // 3. Sort the results on our server based on the sortBy parameter
            stocks.sort((a, b) => {
                switch (sortBy) {
                    case 'change':
                        // 按涨跌幅排序 (从高到低)
                        return (b.regularMarketChangePercent || 0) - (a.regularMarketChangePercent || 0);

                    case 'amplitude':{
                        // 按振幅排序 (当日最高价 - 当日最低价) / 昨日收盘价
                        const amplitudeA = ((a.regularMarketDayHigh - a.regularMarketDayLow) / a.regularMarketPreviousClose) || 0;
                        const amplitudeB = ((b.regularMarketDayHigh - b.regularMarketDayLow) / b.regularMarketPreviousClose) || 0;
                        return amplitudeB - amplitudeA;
                    }
                    case 'volume':
                    default:
                        // 默认按成交量排序 (从高到低)
                        return (b.regularMarketVolume || 0) - (a.regularMarketVolume || 0);
                }
            });

            // 4. Map the sorted data to the clean format required by the frontend
            const formattedData = stocks.map(stock => {
                const formatChangePercent = (changePercent) => {
                   if (typeof changePercent !== 'number') return 'N/A';
                   const percentage = changePercent.toFixed(2);
                   return changePercent > 0 ? `+${percentage}%` : `${percentage}%`;
               };
               
               // Helper to format large volume numbers
               const formatVolume = (volume) => {
                   if (typeof volume !== 'number') return 'N/A';
                   if (volume > 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
                   if (volume > 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
                   if (volume > 1_000) return `${(volume / 1_000).toFixed(2)}K`;
                   return volume.toString();
               }

               // Calculate and format amplitude
               const amplitudeRatio = (stock.regularMarketDayHigh && stock.regularMarketDayLow && stock.regularMarketPreviousClose)
                   ? (stock.regularMarketDayHigh - stock.regularMarketDayLow) / stock.regularMarketPreviousClose
                   : 0;
               
               const formattedAmplitude = `${(amplitudeRatio * 100).toFixed(2)}%`;

               return {
                   ticker: stock.symbol,
                   name: stock.shortName || stock.symbol,
                   price: (stock.regularMarketPrice || 0).toFixed(2),
                   change: formatChangePercent(stock.regularMarketChangePercent),
                   volume: formatVolume(stock.regularMarketVolume),
                   amplitude: formattedAmplitude
               }
           });
           
           return formattedData;

        } catch (error) {
            console.error('调用热门股票API失败:', error.response ? error.response.data : error.message);
            throw new Error('获取热门股票数据失败。');
        }
    }
   
    /**
     * 搜索股票并返回格式化数据
     * @param {string} query - 搜索关键词
     * @returns {Promise<object>} 格式化后的响应数据
     */
    static async searchStocksByFullName(query) {
        try {
            // 验证输入参数
            if (!query || typeof query !== 'string') {
                throw new Error('无效的搜索关键词');
            }
    
            // 1. 修复 SQL 语句格式（移除多余换行，确保语法正确）
            const sql = `
                SELECT 
                stock_code,
                full_name,
                open_price,
                high_price,
                low_price,
                close_price,
                timestamp
            FROM stock_price_history
            WHERE 
                full_name LIKE ?
                AND time_interval = '1m'
            ORDER BY timestamp DESC  
            LIMIT 1  
            `;
    
            const results = await db.execute(sql, [`%${query}%`]);

            // 验证结果格式
            if (!Array.isArray(results)) {
                throw new Error('数据库查询返回格式不正确');
            }
    
            // 验证结果格式
            if (!Array.isArray(results)) {
                throw new Error('数据库查询返回格式不正确');
            }
    
            // 格式化数据
            const formattedData = results.map(item => ({
                stockCode: item.stock_code,
                fullName: item.full_name,
                openPrice: item.open_price,
                highPrice: item.high_price,
                lowPrice: item.low_price,
                closePrice: item.close_price
            }));
    
            return {
                success: true,
                count: formattedData.length,
                data: formattedData
            };
        } catch (error) {
            console.error('搜索股票失败:', error);
            throw error;
        }
    }    
    /**
     * 搜索单只股票的历史数据并返回格式化数据
     * @param {string} "symbol, interval"  - 搜索关键词（Symbol、interval）
     * @returns {Promise<object>} 格式化后的响应数据
     */
    static async searchHistory(symbol, interval) {
        try {
            const sql = `
            SELECT
                stock_code,
                full_name,
                timestamp,
                open_price,
                close_price,
                high_price,
                low_price,
                volume,
                (high_price - low_price)/open_price AS intraday_volatility,
                (high_price + low_price)/2 AS aver_price
            FROM 
                stock_price_history
            WHERE 
                stock_code = ?
                AND time_interval = ?
            ORDER BY 
                timestamp ASC
            `;
         // 2. 正确处理 mysql 库的参数绑定（使用回调+Promise 封装）
         const results = await db.execute(sql, [symbol, interval]);

            // 验证结果格式
            if (!Array.isArray(results)) {
                throw new Error('数据库查询返回格式不正确');
            }
         // 格式化数据 - 修正变量名并完善字段处理 
        const formattedData = results.map(item => ({
            // 基础信息
            stockCode: item.stock_code || '',
            fullName: item.full_name || '未知名称',
            timestamp: item.timestamp,  // 保留时间戳
            
            // 价格信息（格式化数字）
            openPrice: item.open_price !== null ? Number(item.open_price).toFixed(2) : '0.00',
            highPrice: item.high_price !== null ? Number(item.high_price).toFixed(2) : '0.00',
            lowPrice: item.low_price !== null ? Number(item.low_price).toFixed(2) : '0.00',
            closePrice: item.close_price !== null ? Number(item.close_price).toFixed(2) : '0.00',
            
            // 新增：成交量（整数处理）
            volume: item.volume !== null ? Number(item.volume).toLocaleString() : '0',
            
            // 波动率和平均价格（保留相应小数位）
            intradayVolatility: item.intraday_volatility !== null 
            ? (Number(item.intraday_volatility) * 100).toFixed(2) + '%' 
            : '0.00%',
            averagePrice: item.aver_price !== null ? Number(item.aver_price).toFixed(2) : '0.00'
        }));

        return {
            success: true,
            count: formattedData.length,
            data: formattedData,
        };
    } catch (error) {
        console.error('搜索股票失败:', error);
        throw error;
    }
  }
}
module.exports = StockModel;