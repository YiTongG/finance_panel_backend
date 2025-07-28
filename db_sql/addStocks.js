// 添加股票基本信息
const axios = require('axios');
const mysql = require('mysql2/promise');
const fetchSymbols = require('./getStocks');

// ✅ 替换为你的 RapidAPI Key
const RAPIDAPI_KEY = '0359ffe29fmshe5032451d5e5666p16633ejsnb46adcfb169e';

// const STOCK_SYMBOL = 'JPM'; // 要查询的股票代码

// 创建 MySQL 连接
async function connectToDatabase() {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'finance'
    });
}

// 获取 profile 接口的数据（sector, industry, phone, address, website）
async function fetchProfile(symbol) {
    const url = `https://yh-finance.p.rapidapi.com/stock/v3/get-profile`;
    const response = await axios.get(url, {
        params: {
            symbol,
            region: 'US',
            lang: 'en-US'
        },
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
        }
    });

    const profile = response.data?.quoteSummary?.result?.[0]?.summaryProfile || {};
    return {
        market_sector: profile.sector || null,
        industry: profile.industryDisp || null,
        address: profile.address1 || null,
        phone: profile.phone || null,
        website: profile.website || null
    };
}

// 获取 quote 接口的数据（longName, currency, IPO date）
async function fetchQuote(symbol) {
    const url = `https://yh-finance.p.rapidapi.com/market/v2/get-quotes`;
    const response = await axios.get(url, {
        params: {
            region: 'US',
            symbols: symbol
        },
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
        }
    });

    const quote = response.data?.quoteResponse?.result?.[0] || {};
    const summary = quote.quoteSummary || {};
    const summaryDetail = summary.summaryDetail || {};

    return {
        full_name: quote.longName || null,
        currency: summaryDetail.currency || null,
        ipo_date: quote.firstTradeDateMilliseconds
            ? new Date(quote.firstTradeDateMilliseconds).toISOString().split('T')[0]
            : null
    };
}

// 主函数：组合数据并插入数据库
async function updateStockInfo() {
    const db = await connectToDatabase();

    try {
        const symbols = await fetchSymbols();

        for (const symbol of symbols) {
            const profile = await fetchProfile(symbol);
            const quote = await fetchQuote(symbol);

            const data = {
                stock_code: symbol,
                full_name: quote.full_name,
                market_sector: profile.market_sector,
                industry: profile.industry,
                currency: quote.currency,
                ipo_date: quote.ipo_date,
                address: profile.address,
                phone: profile.phone,
                website: profile.website
            };

            console.log(data);

            try {
                const [rows] = await db.execute(
                    `
                INSERT INTO stocks (
                    stock_code, full_name, market_sector, industry, currency,
                    ipo_date, address, phone, website
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
--                 ON DUPLICATE KEY UPDATE
--                     full_name = VALUES(full_name),
--                     market_sector = VALUES(market_sector),
--                     industry = VALUES(industry),
--                     currency = VALUES(currency),
--                     ipo_date = VALUES(ipo_date),
--                     address = VALUES(address),
--                     phone = VALUES(phone),
--                     website = VALUES(website),
--                     update_time = CURRENT_TIMESTAMP
                `,
                    [
                        data.stock_code,
                        data.full_name,
                        data.market_sector,
                        data.industry,
                        data.currency,
                        data.ipo_date,
                        data.address,
                        data.phone,
                        data.website
                    ]
                );

                console.log(`✅ 股票 ${symbol} 信息已更新或插入。`);
            } catch (insertErr) {
                if (insertErr.code === 'ER_DUP_ENTRY') {
                    console.warn(`⚠️ 股票 ${symbol} 已存在，跳过。`);
                    continue;
                } else {
                    console.error(`❌ 插入股票 ${symbol} 信息失败：`, insertErr);
                    continue;
                }
            }
        }

    } catch (err) {
        console.error('❌ fetchSymbols 或其他错误：', err);
    } finally {
        await db.end();
        console.log('✅ 所有数据处理完成');
    }
}

// 启动
updateStockInfo();
