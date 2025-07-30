

const transactionModel = require('../models/transactionModel');

  exports.getUserStockInformation=async (req, res) => {
    try {
      const { UserID } = req.params;

      if (!UserID) {
        return res.status(400).json({ message: 'UserID参数不能为空' });
      }
     const data = await transactionModel.getInformation(UserID);
     res.json(data); 
   } catch (error) {
     res.status(500).json({ message: '获取用户股票信息失败', error: error.message });
   }
 };