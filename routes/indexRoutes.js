// routes/indexesRoutes.js
 
const express = require('express'); 
const router = express.Router();
const indexController = require('../controllers/indexController');


router.get('/chart/:ticker', indexController.fetchChartInfo);

/**
/**
 * Homepage Pie Chart: Global distribution of fastest-growing stocks
 * @route GET /api/indexes/regionTrend
 * @group Index - Operations about indexes
 * @returns {Array<object>} 200 - An array of objects, each representing the stock distribution in a region.
 * @returns {Error} - An error object
 */
router.get('/regionTrend', indexController.fetchRegionTrending);

module.exports = router;