// models/stocksModel.js

// const axios = require('axios'); // 真实情况会用axios等工具请求外部API
// const db = require('../db'); // 导入你的数据库连接

// --- 模拟数据区 ---
// 在真实应用中，这些数据会从外部API或数据库获取
const MOCK_INDEXES = [
    { name: "上证指数", value: "3625.44", change: "-0.87%" },
    { name: "深证成指", value: "10788.01", change: "-0.45%" },
    { name: "标普500", value: "4488.08", change: "+0.92%" },
    { name: "纳斯达克", value: "11840.40", change: "+1.15%" },
    { name: "道琼斯", value: "32353.30", change: "-0.23%" },
  ];
  
  const MOCK_HOT_STOCKS = {
      volume: [ // 按成交量排序
          { ticker: "BABA", name: "阿里巴巴", price: "89.45", change: "-5.67%", volume: "45.2M" },
          { ticker: "NIO", name: "蔚来", price: "12.34", change: "-3.89%", volume: "32.1M" },
          { ticker: "PDD", name: "拼多多", price: "67.89", change: "-4.23%", volume: "28.7M" },
          { ticker: "XPEV", name: "小鹏汽车", price: "8.56", change: "-3.45%", volume: "19.8M" },
      ],
      change: [ // 按跌幅排序 (示例)
          { ticker: "BABA", name: "阿里巴巴", price: "89.45", change: "-5.67%", volume: "45.2M" },
          { ticker: "PDD", name: "拼多多", price: "67.89", change: "-4.23%", volume: "28.7M" },
          { ticker: "NIO", name: "蔚来", price: "12.34", change: "-3.89%", volume: "32.1M" },
          { ticker: "XPEV", name: "小鹏汽车", price: "8.56", change: "-3.45%", volume: "19.8M" },
      ]
  };
  
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
                    const rawPercent = regularMarketChangePercent * 100; // Convert decimal to percentage
                    const formattedPercent = rawPercent.toFixed(2); // Format to 2 decimal places
                    return rawPercent > 0 ? `+${formattedPercent}%` : `${formattedPercent}%`; // Add sign and '%'
                
                };

                return {
                    name: index.shortName || index.longName,
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
      static async fetchHotStocks(sortBy = 'volume') {
          const data = MOCK_HOT_STOCKS[sortBy] || MOCK_HOT_STOCKS.volume;
          return new Promise(resolve => setTimeout(() => resolve(data), 200));
      }
  
      /**
       * 获取行业板块
       * 真实实现：调用外部API获取板块数据，或者自己根据成分股计算
       */
      static async fetchSectors() {
          return new Promise(resolve => setTimeout(() => resolve(MOCK_SECTORS), 150));
      }
  
      /**
       * 搜索股票
       * @param {string} query - 搜索关键词
       * 真实实现：查询持久化在自己数据库中的股票基础信息表
       */
      static async searchStocks(query) {
          // const sql = "SELECT ticker, name FROM stocks WHERE ticker LIKE ? OR name LIKE ?";
          // const results = await db.query(sql, [`%${query}%`, `%${query}%`]);
          // return results;
  
          // 模拟数据库查询
          const lowerCaseQuery = query.toLowerCase();
          const results = MOCK_STOCK_LIST.filter(
              stock => stock.ticker.toLowerCase().includes(lowerCaseQuery) || stock.name.toLowerCase().includes(lowerCaseQuery)
          );
          return new Promise(resolve => setTimeout(() => resolve(results), 50));
      }
  }
  
  module.exports = StockModel;