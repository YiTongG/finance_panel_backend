// routes/stocksRoutes.js
 
const express = require('express'); 
const router = express.Router();
const stockController = require('../controllers/stockController');

/**
 * Get Stock Indexes
 * @route GET /api/stocks/indexes
 * @group Stock - Operations about stocks
 * @returns {Array<object>} 200 - An array of stock index data.
 * @returns {Error} - An error message
 */
router.get('/indexes', stockController.getIndexes);

/**
 * Get Hot Stocks
 * @route GET /api/stocks/hot
 * @group Stock - Operations about stocks
 * @param {string} sortBy.query - The sorting criteria. Accepts 'volume', 'amplitude', or 'change'.
 * @returns {Array<object>} 200 - An array of popular or trending stocks, sorted by the specified criteria.
 * @returns {Error} - An error message
 */
router.get('/hot', stockController.getHotStocks);

/**
 * Get Stock Recommendation Trends
 * @route GET /api/stocks/getTrends/{symbol}
 * @group Stock - Operations about stocks
 * @param {string} symbol.path.required - The stock symbol (e.g., AAPL).
 * @returns {object} 200 - An object containing trend data for the specified stock.
 * @returns {Error} - An error message
 */
router.get('/getTrends/:symbol', stockController.getTrends);

/**
 * Search for Stocks
 * @description Search for stocks by their full name or symbol using a fuzzy search (supports English and Pinyin).
 * @route GET /api/stocks/search
 * @group Stock - Operations about stocks
 * @param {string} query.query.required - The search term for the stock (e.g., "Tesla", "TSLA").
 * @returns {object} 200 - A successful response object containing the search results.
 * @property {boolean} success - Indicates if the API call was successful.
 * @property {number} count - The number of stocks returned in the data array.
 * @property {Array<object>} data - The array of stock objects found. Each object contains stockCode, fullName, openPrice, highPrice, lowPrice, and closePrice.
 * @returns {Error} - An error message
 */
router.get('/search', stockController.searchStocks);

/**
 * Get Historical Stock Data
 * @description Fetches historical time-series data (candlesticks) for a specific stock symbol based on a given time interval.
 * @route GET /api/stocks/history
 * @group Stock - Operations about stocks
 * @param {string} symbol.query.required - The stock symbol to fetch historical data for (e.g., 'TSLA', 'AAPL').
 * @param {string} interval.query.required - The time interval between data points (e.g., '1m', '5m', '1d', '1wk', '1mo').
 * @returns {object} 200 - A response object containing the historical data points.
 * @property {boolean} success - Indicates if the API call was successful.
 * @property {number} count - The number of historical data points returned.
 * @property {Array<object>} data - An array of historical data points (candlesticks). Each object contains details like timestamp, openPrice, highPrice, lowPrice, closePrice, and volume.
 * @returns {Error} - An error message
 */
router.get('/history', stockController.searchHistoryStocks);
module.exports = router;