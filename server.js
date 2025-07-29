require('dotenv').config();
const express = require('express');
const expressSwagger = require('express-swagger-generator');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 5000;

//swagger doc
const options = {
  swaggerDefinition: {
    info: {
      title: 'Finance Backend API',
      version: '1.0.0',
      description: 'API documentation',
    },
    basePath: '/',
    produces: ['application/json'],
    schemes: ['http'],
  },
  basedir: __dirname,
  files: ['./routes/*.js'],
};

expressSwagger(app)(options);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => res.send('服务器已启动'));

// Routes
const transactionRoutes = require('./routes/transactionRoutes');
const stocksRoutes = require('./routes/stocksRoutes');
const indexRoutes = require('./routes/indexRoutes');
const globalRoutes  = require('./routes/globalRoutes')
const swaggerRouter = require('./routes/swagger');

app.use('/api/transactions', transactionRoutes);
app.use('/api/indexes', indexRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/global', globalRoutes);
app.use('/api-docs', swaggerRouter);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});