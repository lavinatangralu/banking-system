const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { generateAccountNumber } = require('../utils/accountUtils');

/**
 * Register a new User and auto-create a Bank Account
 * Route: POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique account number
    let accountNumber = generateAccountNumber();
    let accountExists = await prisma.account.findUnique({ where: { accountNumber } });

    while (accountExists) {
      accountNumber = generateAccountNumber();
      accountExists = await prisma.account.findUnique({ where: { accountNumber } });
    }

    // Create User, Account, and Welcome Deposit ($1000) inside an ACID transaction
    const initialDeposit = 1000.0;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const newUser = await tx.user.create({
        data: {
          fullName,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        },
      });

      // 2. Create Bank Account
      const newAccount = await tx.account.create({
        data: {
          accountNumber,
          balance: initialDeposit,
          userId: newUser.id,
        },
      });

      // 3. Record Welcome Bonus Transaction
      await tx.transaction.create({
        data: {
          amount: initialDeposit,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          description: 'Welcome Account Opening Bonus',
          receiverAccountId: newAccount.id,
        },
      });

      return { user: newUser, account: newAccount };
    });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: result.user.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully with $1,000 welcome credit!',
      token,
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        account: {
          id: result.account.id,
          accountNumber: result.account.accountNumber,
          balance: result.account.balance,
          currency: result.account.currency,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user with email and password
 * Route: POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user with their bank account
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { account: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        account: user.account
          ? {
              id: user.account.id,
              accountNumber: user.account.accountNumber,
              balance: user.account.balance,
              currency: user.account.currency,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile and account details
 * Route: GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        account: {
          select: {
            id: true,
            accountNumber: true,
            balance: true,
            currency: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};

