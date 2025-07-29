// routes/globalRoutes.js
 
const express = require('express'); 
const router = express.Router();
const globalController = require('../controllers/globalController');


router.get('/news', globalController.fetchNews);
//router.get('/overview', globalController.fetchDaliyOverview);

module.exports = router;