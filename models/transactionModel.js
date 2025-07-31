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
        return {
            success: false,
            count: 0,
            data: null,
            error: error.message
        };
    }
   }
 
 /**
     * 获取用户持有股票的数量
     * @param {number} userId - 用户ID
     * @param {string} stockCode - 股票代码
     * @returns {Promise<number>} 持有数量
     */
 static async getUserStockQuantity(userId, stockCode) {
    const [rows] = await db.execute(
        'SELECT quantity FROM user_trade WHERE user_id = ? AND stock_code = ?',
        [userId, stockCode]
    );
    return rows.length > 0 ? rows[0].quantity : 0;
}

/**
 * 获取用户的资金余额
 * @param {number} userId - 用户ID
 * @returns {Promise<number>} 资金余额
 */
static async getUserMoney(userId) {
    const [rows] = await db.execute(
        'SELECT money FROM user WHERE id = ?',
        [userId]
    );
    return rows.length > 0 ? rows[0].money : 0;
}

/**
 * 执行交易
 * @param {number} userId - 用户ID
 * @param {string} stockCode - 股票代码
 * @param {'BUY'|'SELL'} type - 交易类型
 * @param {number} shares - 交易数量
 * @param {number} price - 股票价格
 * @returns {Promise<object>} 交易结果
 */
static async executeTransaction(userId, stockCode, type, shares, price) {
    // 计算交易金额
    const amount = shares * price;

    // 开始事务（使用封装的 beginTransaction 方法， await 等待事务开启）
    await db.beginTransaction();

    try {
      // 获取当前数据（使用 model 里的方法，这里要确保 this 指向正确，或者直接用 db 里的方法）
      const [currentQuantity, currentMoney] = await Promise.all([
        this.getUserStockQuantity(userId, stockCode),
        this.getUserMoney(userId)
      ]);

      let newQuantity, newMoney;

      if (type === 'BUY') {
        // 买入逻辑
        if (amount > currentMoney) {
          throw new Error('余额不足');
        }

        newQuantity = currentQuantity + shares;
        newMoney = currentMoney - amount;

        // 更新或插入股票持有记录
        if (currentQuantity > 0) {
          await db.execute(
            'UPDATE user_trade SET quantity = ? WHERE user_id = ? AND stock_code = ?',
            [newQuantity, userId, stockCode]
          );
        } else {
          await db.execute(
            'INSERT INTO user_trade (user_id, stock_code, quantity) VALUES (?, ?, ?)',
            [userId, stockCode, newQuantity]
          );
        }
      } else if (type === 'SELL') {
        // 卖出逻辑
        if (shares > currentQuantity) {
          throw new Error('股票数量不足');
        }

        newQuantity = currentQuantity - shares;
        newMoney = currentMoney + amount;

        // 更新股票持有记录
        await db.execute(
          'UPDATE user_trade SET quantity = ? WHERE user_id = ? AND stock_code = ?',
          [newQuantity, userId, stockCode]
        );
      }

      // 更新用户资金
      await db.execute(
        'UPDATE user SET money = ? WHERE id = ?',
        [newMoney, userId]
      );

      // 提交事务（await 等待事务提交）
      await db.commit();

      // 返回更新后的数据
      return {
        userId,
        stockCode,
        quantity: newQuantity,
        money: newMoney
      };
    } catch (error) {
      // 回滚事务（await 等待事务回滚）
      await db.rollback();
      throw error;
    }
  }

  // 把获取股票数量和资金的方法也挂载到 model 上，保持调用一致
  static async getUserStockQuantity(userId, stockCode) {
    return db.getStockQuantity(userId, stockCode);
  }

  static async getUserMoney(userId) {
    return db.getMoney(userId);
  }

}
module.exports = transactionModel;