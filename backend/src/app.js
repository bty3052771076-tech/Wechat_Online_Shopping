const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const addressRoutes = require('./routes/address');
const sequelize = require('./config/database');

require('./models');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

app.use((req, res) => {
  res.status(404).json({
    code: 'NotFound',
    data: null,
    msg: '接口不存在',
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    code: 'ServerError',
    data: null,
    msg: err.message || '服务器内部错误',
  });
});

function startServer(port = process.env.PORT || 3000) {
  const server = app.listen(port, () => {
    const actualPort = server.address().port;

    console.log('=================================');
    console.log('Server started');
    console.log(`Port: ${actualPort}`);
    console.log(`Env: ${process.env.NODE_ENV}`);
    console.log(`API: http://localhost:${actualPort}`);
    console.log('=================================');
  });

  return server;
}

if (require.main === module) {
  startServer();
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

module.exports = app;
module.exports.startServer = startServer;
