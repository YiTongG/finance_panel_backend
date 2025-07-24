const db = require('../db');

class Transaction {
  static getAll(callback) {
    db.query('SELECT * FROM transactions', callback);
  }
  static create(transaction, callback) {
    const { title, amount, type, category, date, description } = transaction;
    db.query(
      'INSERT INTO transactions SET ?',
      { title, amount, type, category, date, description },
      callback
    );
  }
  static update(id, transaction, callback) {
    db.query(
      'UPDATE transactions SET ? WHERE id = ?',
      [transaction, id],
      callback
    );
  }

  static delete(id, callback) {
    db.query('DELETE FROM transactions WHERE id = ?', [id], callback);
  }
}
module.exports = Transaction;