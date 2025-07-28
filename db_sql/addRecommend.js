const axios = require('axios');
const mysql = require('mysql2/promise');

// 配置数据库
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'finance',
};

const symbol = 'TSLA';

// RapidAPI 请求配置
const options = {
    method: 'GET',
    url: 'https://yh-finance.p.rapidapi.com/stock/get-recommendation-trend',
    params: {
        symbol: symbol,
        region: 'US',
        lang: 'en-US'
    },
    headers: {
        'X-RapidAPI-Key': '0359ffe29fmshe5032451d5e5666p16633ejsnb46adcfb169e',
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
    },
};

async function fetchAndInsertRecommendations(symbol) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        // 请求接口
        const response = await axios.request({ ...options, params: { symbol, region: 'US', lang: 'en-US' } });
        const trends = response.data.quoteSummary?.result?.[0]?.recommendationTrend?.trend;

        if (!trends || !Array.isArray(trends)) {
            console.error('❌ 无有效推荐数据');
            return;
        }

        const insertQuery = `
      INSERT INTO stock_recommendation (
        stock_code, period, strong_buy, buy, hold, sell, strong_sell, create_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const now = new Date();

        for (const item of trends) {
            const values = [
                symbol,
                item.period,
                item.strongBuy || 0,
                item.buy || 0,
                item.hold || 0,
                item.sell || 0,
                item.strongSell || 0,
                now
            ];
            console.log(values);
            try {
                await connection.execute(insertQuery, values);
                console.log(`✅log 插入成功: ${symbol} - ${item.period}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.warn(`⚠️ 已存在记录，跳过: ${symbol} - ${item.period}`);
                } else {
                    console.error(`❌ 插入失败: ${err.message}`);
                }
            }
        }

    } catch (err) {
        console.error('❌ 请求失败:', err.message);
    } finally {
        await connection.end();
        console.log('✅ 数据处理完成');
    }
}

// 执行函数（这里你可以替换 symbol 为其他股票代码）
fetchAndInsertRecommendations(symbol);
