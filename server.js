require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => res.send('服务器已启动'));

// Routes
const transactionRoutes = require('./routes/transactionRoutes');
const stocksRoutes = require('./routes/stocksRoutes');
const indexRoutes = require('./routes/indexRoutes');


app.use('/api/transactions', transactionRoutes);
app.use('/api/indexes', indexRoutes);

app.use('/api/stocks', stocksRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});