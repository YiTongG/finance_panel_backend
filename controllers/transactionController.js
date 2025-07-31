

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

    /**
     * 处理交易请求
     * @param {import('express').Request} req - 请求对象
     * @param {import('express').Response} res - 响应对象
     */
    exports.handleTransaction = async(req, res) => {
        try {
            // 从请求中获取参数
            const { userId, stockCode, type, shares, price } = req.body;
            
            // 基本参数验证
            if (!userId || !stockCode || !type || shares === undefined || price === undefined) {
                return res.status(200).json({
                    code: 200,
                    body: '缺少必要的交易参数'
                });
            }
            
            // 验证交易类型
            if (!['BUY', 'SELL'].includes(type)) {
                return res.status(200).json({
                    code: 200,
                    body: '交易类型必须是BUY或SELL'
                });
            }
            
            // 验证数量和价格为正数
            if (shares <= 0 || price <= 0) {
                return res.status(200).json({
                    code: 200,
                    body: '交易数量和价格必须为正数'
                });
            }
            
            // 执行交易
            const result = await transactionModel.executeTransaction(
                userId, 
                stockCode, 
                type, 
                shares, 
                price
            );
            
            // 返回成功结果
            return res.status(200).json({
                code: 200,
                body: '交易成功',
                data: result
            });
            
        } catch (error) {
            // 处理特定错误
            if (error.message === '余额不足') {
                return res.status(200).json({
                    code: 200,
                    body: '您的余额不足'
                });
            }
            
            if (error.message === '股票数量不足') {
                return res.status(200).json({
                    code: 200,
                    body: '您的股票数量不足'
                });
            }
            
            // 处理其他错误
            console.error('交易处理错误:', error);
            return res.status(500).json({
                code: 500,
                body: '服务器错误，交易失败'
            });
        }
    };    