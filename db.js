const mysql = require('mysql');
require('dotenv').config();

// 创建数据库连接
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "WMySql",
//   password: "123456",
//   database: "finance_db"
// });
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// 连接数据库
db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err.stack);
    return;
  }
  console.log('MySQL connected as id', db.threadId);
});

// 执行SQL语句的通用方法
function execute(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

// 开始事务
function beginTransaction() {
  return new Promise((resolve, reject) => {
    db.beginTransaction(error => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}

// 提交事务
function commit() {
  return new Promise((resolve, reject) => {
    db.commit(error => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}

// 回滚事务
function rollback() {
  return new Promise((resolve, reject) => {
    db.rollback(error => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}

// 获取用户持有的股票数量
async function getUserStockQuantity(userId, stockCode) {
  const sql = `
    SELECT IFNULL(quantity, 0) as quantity 
    FROM user_trade 
    WHERE user_id = ? AND stock_code = ?
  `;
  const results = await execute(sql, [userId, stockCode]);
  return results.length > 0 ? results[0].quantity : 0;
}

// 获取用户当前资金
async function getUserMoney(userId) {
  const sql = 'SELECT money FROM user WHERE id = ?';
  const results = await execute(sql, [userId]);
  if (results.length === 0) {
    throw new Error('用户不存在');
  }
  return results[0].money;
}

// 导出所有需要的方法和连接对象
module.exports = {
  db,
  execute,
  beginTransaction,
  commit,
  rollback,
  getUserStockQuantity,
  getUserMoney
};