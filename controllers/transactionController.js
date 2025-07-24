const Transaction = require('../models/transactionModel');

module.exports = {
  getAllTransactions: (req, res) => {
    Transaction.getAll((err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },
  
  createTransaction: (req, res) => {
    const newTransaction = req.body;
    Transaction.create(newTransaction, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...newTransaction });
    });
  },

  updateTransaction: (req, res) => {
    const id = req.params.id;
    Transaction.update(id, req.body, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id, ...req.body });
    });
  },

  deleteTransaction: (req, res) => {
    const id = req.params.id;
    Transaction.delete(id, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Transaction deleted' });
    });
  }
};