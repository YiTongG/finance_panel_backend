const db = require('../db');

class transactionModel {
  /**
   * 
   * 获取用户持有的股票信息
   * 
   */
  
  static async getInformation(UserID) {
    const sql = `
        SELECT 
            u.id AS user_id,
            u.img_url AS user_img,
            u.user_name,
            u.money,
            u.create_time AS user_Buytime,
            ut.stock_code,
            ut.trade_time AS user_Tradetime,
            SUM(CASE 
                WHEN trade_type = 'BUY' THEN quantity 
                WHEN trade_type = 'SELL' THEN -quantity 
                ELSE 0 
            END) AS holding_quantity
        FROM 
            user u
        INNER JOIN 
            user_trade ut ON u.id = ut.user_id  
        WHERE 
            ut.user_id = ?
        GROUP BY 
            u.id, u.img_url, u.user_name, u.money, 
            u.create_time, ut.stock_code, ut.trade_time 
        HAVING 
            holding_quantity > 0
        LIMIT 5
    `;
    
    try {
        const results = await new Promise((resolve, reject) => {
            // 确保参数数组与SQL中的?一一对应
            db.query(sql, [UserID], (err, results) => {
                if (err) {
                    console.error('SQL 执行错误:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        // 验证结果格式是否为数组
        if (!Array.isArray(results)) {
            throw new Error('数据库查询返回格式不正确，预期为数组');
        }

        // 格式化数据，统一字段命名风格（与SQL查询字段对应）
        const formattedData = results.map(item => ({
            userId: item.user_id,
            userImg: item.user_img,
            userName: item.user_name,
            money: item.money,
            userBuytime: item.user_Buytime,
            stockCode: item.stock_code,
            userTradetime: item.user_Tradetime,
            holdNumber: item.holding_quantity
        }));

        // 返回包含状态、数量和数据的统一格式
        return {
            success: true,
            count: formattedData.length,
            data: formattedData
        };
    } catch (error) {
        console.error('获取用户股票信息失败:', error);
        throw error; // 抛出错误让控制器处理
    }
}
}
module.exports = transactionModel;