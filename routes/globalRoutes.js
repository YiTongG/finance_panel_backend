// routes/globalRoutes.js
 
const express = require('express'); 
const router = express.Router();
const globalController = require('../controllers/globalController');


/**
 * Get Home Page News Recommendations
 * @description Fetches a list of recommended news articles for the home page.
 * @route POST /api/global/news
 * @group Global - General-purpose endpoints
 * @returns {Array<object>} 200 - An array of recommended news articles. Each object contains a title and a link.
 * @returns {Error} - An error object
 */
router.post('/news', globalController.fetchNews);
//router.get('/overview', globalController.fetchDaliyOverview);

module.exports = router;