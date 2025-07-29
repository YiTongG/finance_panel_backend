// routes/indexesRoutes.js
 
const express = require('express'); 
const router = express.Router();
const indexController = require('../controllers/indexController');


router.get('/chart/:ticker', indexController.fetchChartInfo);
router.get('/regionTrend', indexController.fetchRegionTrending);

module.exports = router;