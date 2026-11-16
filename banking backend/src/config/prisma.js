const { PrismaClient } = require('@prisma/client');

// Instantiate Prisma Client to interact with PostgreSQL
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;

