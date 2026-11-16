const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./config/prisma');
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
PS C: \Users\USER\OneDrive\Desktop\Lavina workspace antigravity\banking system > git config--global user.name "Lavina T"
git: The term 'git' is not recognized as the name of a cmdlet, function, script file,
  or operable program.Check the spelling of the name, or if a path was included, verify 
that the path is correct and try again.
At line: 1 char: 1
  + git config--global user.name "Lavina T"
    + ~~~
    + CategoryInfo          : ObjectNotFound: (git: String) [], CommandNotFoundException
      + FullyQualifiedErrorId : CommandNotFoundException
 
PS C: \Users\USER\OneDrive\Desktop\Lavina workspace antigravity\banking system >

  // Body parser
  app.use(express.json());

// System Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Core Banking API',
    database: 'PostgreSQL (Prisma)',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`🏦 Core Banking Server running on port ${PORT}`);
  console.log(`🔗 API Base URL:   http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check:   http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);

  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('💡 Tip: Verify PostgreSQL is running and DATABASE_URL in .env is configured');
  }
});
