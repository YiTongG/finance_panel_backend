// 获取最活跃股票
const axios = require('axios');

async function fetchSymbols() {
    const options = {
        method: 'GET',
        url: 'https://yh-finance.p.rapidapi.com/market/v2/get-movers',
        params: {
            region: 'US',
            lang: 'en-US',
            count: '5',
            start: '0',           // 返回多少条数据
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

module.exports = fetchSymbols; // 导出方法
