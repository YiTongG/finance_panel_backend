// models/stocksModel.js

// const axios = require('axios'); // 真实情况会用axios等工具请求外部API
const db = require('../db'); // 导入你的数据库连接

// --- 模拟数据区 ---
// 在真实应用中，这些数据会从外部API或数据库获取
const MOCK_INDEXES = [
    { name: "上证指数", value: "3625.44", change: "-0.87%" },
    { name: "深证成指", value: "10788.01", change: "-0.45%" },
    { name: "标普500", value: "4488.08", change: "+0.92%" },
    { name: "纳斯达克", value: "11840.40", change: "+1.15%" },
    { name: "道琼斯", value: "32353.30", change: "-0.23%" },
  ];
  
  const HOT_STOCK_UNIVERSE = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', // US Tech Giants
    'BABA', 'NIO', 'PDD', 'XPEV' // Popular Chinese Stocks
];

  const MOCK_SECTORS = [
      { name: "科技股", change: "+5.2%" },
      { name: "银行股", change: "-1.3%" },
      { name: "新能源", change: "+3.8%" },
      { name: "医药生物", change: "+2.1%" },
      { name: "房地产", change: "-2.2%" },
      { name: "消费股", change: "-0.8%" },
  ];
  
  const MOCK_STOCK_LIST = [
      { ticker: 'BABA', name: '阿里巴巴' },
      { ticker: 'PDD', name: '拼多多' },
      { ticker: 'NIO', name: '蔚来' },
      { ticker: 'XPEV', name: '小鹏汽车' },
      { ticker: 'TSLA', name: '特斯拉' },
      { ticker: 'AAPL', name: '苹果公司' },
  ];
//  --- 模拟数据区结束 ---
  
// models/stocksModel.js
const axios = require('axios');


const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

// (Ticker)
// ^GSPC: 标普500, ^DJI: 道琼斯, ^IXIC: 纳斯达克
// 000001.SS: 上证指数, 399001.SZ: 深证成指
const INDEX_TICKERS = ['^GSPC', '^DJI', '^IXIC', '000001.SS', '399001.SZ'];
=======

const INDEX_TICKERS = [
    // US Indices
    '^GSPC', // S&P 500
    '^DJI',  // Dow Jones Industrial Average
    '^IXIC', // NASDAQ Composite

    // China Indices
    '000001.SS', // SSE Composite Index (Shanghai)
    '399001.SZ', // SZSE Component Index (Shenzhen)

    // Other Asia-Pacific Indices
    '^N225',     // Nikkei 225 (Japan)
    '^HSI',      // Hang Seng Index (Hong Kong)

    // European Indices
    '^FTSE',     // FTSE 100 (UK)
    '^FCHI',     // CAC 40 (France)

    // --- Added for World Map Coverage ---
    '^GDAXI',    // DAX (Germany)
    '^GSPTSE',   // S&P/TSX Composite (Canada)
    '^AXJO',     // S&P/ASX 200 (Australia)
    '^NSEI',     // NIFTY 50 (India)
    '^BVSP',     // Bovespa Index (Brazil)
    '^KS11'      // KOSPI Composite Index (South Korea)
];
  class StockModel {
      /**
       * 获取大盘指数
       * 真实实现：调用外部API获取实时指数数据
       */
      static async fetchIndexes() {
        // 配置axios请求
        const options = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/api/yahoo/qu/quote/${INDEX_TICKERS.join(',')}`,
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            } 
        };

        try {
            const response = await axios.request(options);
            
            // 检查返回的数据是否是一个数组
            if (!Array.isArray(response.data.body)) {
                 console.error("API did not return an array:", response.data.body);
                 throw new Error("从 Yahoo Finance API 获取的数据格式不正确。");
            }
            
            const formattedData = response.data.body.map(index => {
                const formatChangePercent = (regularMarketChangePercent) => {
                    const formattedPercent = regularMarketChangePercent.toFixed(2); // Format to 2 decimal places
                    return formattedPercent > 0 ? `+${formattedPercent}%` : `${formattedPercent}%`; // Add sign and '%'
                
                };

                return {
                    name: (index.shortName || index.longName).replace(/\s{2,}/g, ' '),
                    value: parseFloat(index.regularMarketPrice).toFixed(2),
                    change: formatChangePercent(index.regularMarketChangePercent)
                };
            });

            return formattedData;

        } catch (error) {
            console.error('调用 Yahoo Finance API 失败:', error.response ? error.response.data : error.message);
            throw new Error('获取外部指数数据失败。');
        }
    }
  
      /**
       * 获取热门股票
       * @param {string} sortBy - 排序依据, e.g., 'volume', 'change'
       * 真实实现：调用外部API获取榜单数据
       */
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

                    case 'amplitude':
                        // 按振幅排序 (当日最高价 - 当日最低价) / 昨日收盘价
                        const amplitudeA = ((a.regularMarketDayHigh - a.regularMarketDayLow) / a.regularMarketPreviousClose) || 0;
                        const amplitudeB = ((b.regularMarketDayHigh - b.regularMarketDayLow) / b.regularMarketPreviousClose) || 0;
                        return amplitudeB - amplitudeA;
                    
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
       * 获取股票趋势
       * 真实实现：调用外部API获取股票趋势推荐买入购入，
       */
      static async fetchTrends(symbol) {
        if (!symbol) {
            throw new Error("股票代码（symbol）不能为空");
        }
    
        const options = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/api/v1/markets/stock/modules?ticker=${symbol}&module=recommendation-trend`,
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            } 
        };
        
        try {
            const response = await axios.request(options);
            const stockData = response.data.body; // 获取返回的body数据
            console.log("获取股票趋势数据:", stockData);
            
            // 关键修改：直接验证stockData下的trend数组
            if (!stockData || !Array.isArray(stockData.trend)) {
                console.error("API返回数据格式错误，trend数组不存在或不是数组:", stockData);
                throw new Error("从API获取的趋势数据格式不正确（未找到有效的trend数组）");
            }
            
            // 直接从stockData.trend数组提取所需字段
            const trendData = stockData.trend.map(item => ({
                period: item.period || '未知周期',
                strongBuy: item.strongBuy || 0,
                buy: item.buy || 0,
                hold: item.hold || 0,
                sell: item.sell || 0,
                strongSell: item.strongSell || 0
            }));
    
            return {
                stockName: symbol,
                trends: trendData,
                maxAge: stockData.maxAge || null,
           
            };
        } catch (error) {
            console.error(`获取股票 ${symbol} 推荐趋势失败:`, error.response ? error.response.data : error.message);
            throw new Error(`获取股票 ${symbol} 推荐趋势失败: ${error.message}`);
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
                    close_price
                FROM stock_price_history
                WHERE 
                    full_name LIKE ?
                    AND time_interval = '1m'
            `;
    
            // 2. 正确处理 mysql 库的参数绑定（使用回调+Promise 封装）
            const results = await new Promise((resolve, reject) => {
                // 确保参数数组格式正确，与 SQL 中的 ? 一一对应
                db.query(sql, [`%${query}%`], (err, results) => {
                    if (err) {
                        console.error('SQL 执行错误:', err); // 打印具体错误
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            });
    
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
        
  }
  module.exports = StockModel;