const axios = require('axios');

const region = 'US';
const lang = 'en-US';
const count = 5;
const start = 0;

// 获取热门股票
async function fetchSymbols() {
    const options = {
        method: 'GET',
        url: 'https://yh-finance.p.rapidapi.com/market/v2/get-movers',
        params: {
            region: region,
            lang: lang,
            count: count,
            start: start,           // 返回多少条数据
        },
        headers: {
            'X-RapidAPI-Key': '0359ffe29fmshe5032451d5e5666p16633ejsnb46adcfb169e',
            'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        const quotes = response.data.finance.result[2].quotes;
        const symbols = quotes.map(q => q.symbol);
        return symbols;
    } catch (error) {
        console.error('Error fetching symbols:', error.message);
        return [];
    }
}

// 获取数据库中已有股票代码
async function getStocks(connection) {
    try {
        const [rows] = await connection.execute(
            'SELECT stock_code FROM stocks'
        );
        if (rows.length === 0) {
            console.warn(`未找到数据`);
            return null;
        }
        const stocks = rows.map(item => item.stock_code)
        return stocks;
    } catch (err) {
        console.error(`查询股票出错：`, err);
        return null;
    }
}

module.exports = fetchSymbols; // 导出方法
module.exports = getStocks;
