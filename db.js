const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'finance_db'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err.stack);
    return;
  }
  //console.log('MySQL connected as id', db.threadId);
});

module.exports = db;