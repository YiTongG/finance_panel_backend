// 添加历史行情信息
const axios = require('axios');
const mysql = require('mysql2/promise');
const getStocks = require('./getStocks');

// MySQL 连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'finance',
};

const intervals = ['1m', '2m', '5m', '1d', '1mo'];  // 可以进行添加
const limit = '30';

// async function getStocks(connection) {
//     try {
//         const [rows] = await connection.execute(
//             'SELECT stock_code FROM stocks'
//         );
//         if (rows.length === 0) {
//             console.warn(`未找到数据`);
//             return null;
//         }
//         const stocks = rows.map(item => item.stock_code)
//         return stocks;
//     } catch (err) {
//         console.error(`查询股票出错：`, err);
//         return null;
//     }
// }

async function getStockFullName(connection, stockCode) {
    try {
        const [rows] = await connection.execute(
            'SELECT full_name FROM stocks WHERE stock_code = ?',
            [stockCode]
        );
        if (rows.length === 0) {
            console.warn(`未找到 ${stockCode} 的 full_name`);
            return null;
        }
        return rows[0].full_name;
    } catch (err) {
        console.error(`查询 ${stockCode} 的 full_name 出错：`, err);
        return null;
    }
}

async function fetchStockHistory(symbol, interval) {
    const options = {
        method: 'GET',
        url: 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/stock/history',
        params: {
            symbol: symbol,
            interval: interval,
            limit: limit,
        },
        headers: {
            'X-RapidAPI-Key': '0359ffe29fmshe5032451d5e5666p16633ejsnb46adcfb169e',
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
        },
    };

    try {
        const response = await axios.request(options);
        return { symbol, data: response.data };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        return { symbol, error: error.message };
    }
};

async function fetchAndSaveData() {

    const connection = await mysql.createConnection(dbConfig);
    try {
        // const response = await axios.request(options);
        const symbols = await getStocks(connection); // 替换为你当前请求的股票代码
        for (const symbol of symbols) {
            for (const interval of intervals) {
                const response = await fetchStockHistory(symbol, interval);
                const data = response.data;

                const fullName = await getStockFullName(connection, symbol);

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
                        INSERT INTO stock_price_history (stock_code, full_name, time_interval, timestamp, open_price,
                                                         high_price, low_price, close_price, volume)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    try {
                        await connection.execute(insertQuery, [
                            symbol,
                            fullName,
                            interval,
                            timestamp,
                            open,
                            high,
                            low,
                            close,
                            volume,
                        ]);
                        console.log(symbol,
                            fullName,
                            interval,
                            timestamp,
                            open,
                            high,
                            low,
                            close,
                            volume);
                        console.log(`插入成功: ${timestamp}`);
                    } catch (insertErr) {
                        if (insertErr.code === 'ER_DUP_ENTRY') {
                            console.warn(`重复记录已跳过: ${timestamp}`);
                        } else {
                            console.error('插入出错:', insertErr.message);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('请求失败:', err.message);
    } finally {
        await connection.end();
        console.log('所有数据处理完成');
    }
}

fetchAndSaveData();
