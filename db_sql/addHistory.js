// 添加历史行情信息
const axios = require('axios');
const mysql = require('mysql2/promise');

// ✅ MySQL 连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'finance',
};

// ✅ 请求配置
const options = {
    method: 'GET',
    url: 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/stock/history',
    params: {
        symbol: 'TSLA',        // 替换为目标股票代码
        interval: '1d',        // 时间间隔：1d、5m等
        limit: '10',           // 返回多少条数据
    },
    headers: {
        'X-RapidAPI-Key': '0359ffe29fmshe5032451d5e5666p16633ejsnb46adcfb169e',
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
    },
};

async function fetchAndSaveData() {

    const connection = await mysql.createConnection(dbConfig);
    try {
        const response = await axios.request(options);
        const data = response.data;

        const stockCode = 'TSLA'; // 替换为你当前请求的股票代码
        const timeInterval = '1d'; // 你请求时指定的 interval

        if (!data || !Array.isArray(data.body)) {
            console.error('数据格式异常');
            return;
        }


        for (const item of data.body) {
            const timestamp = item.timestamp;// 转换为 JS Date
            const open = item.open;
            const high = item.high;
            const low = item.low;
            const close = item.close;
            const volume = item.volume;

            const insertQuery = `
        INSERT INTO stock_price_history (
          stock_code, time_interval, timestamp, open_price, high_price, low_price, close_price, volume
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

            try {
                await connection.execute(insertQuery, [
                    stockCode,
                    timeInterval,
                    timestamp,
                    open,
                    high,
                    low,
                    close,
                    volume,
                ]);
                console.log(stockCode,
                        timeInterval,
                        timestamp,
                        open,
                        high,
                        low,
                        close,
                        volume);
                console.log(`✅ 插入成功: ${timestamp}`);
            } catch (insertErr) {
                if (insertErr.code === 'ER_DUP_ENTRY') {
                    console.warn(`⚠️ 重复记录已跳过: ${timestamp}`);
                } else {
                    console.error('❌ 插入出错:', insertErr.message);
                }
            }
        }

    } catch (err) {
        console.error('❌ 请求失败:', err.message);
    } finally {
        await connection.end();
        console.log('✅ 所有数据处理完成');
    }
}

fetchAndSaveData();
