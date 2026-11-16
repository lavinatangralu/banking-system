const prisma = require('../config/prisma');

/**
 * Get account details of the logged-in user
 * Route: GET /api/account/details
 */
const getAccountDetails = async (req, res, next) => {
  try {
    const account = await prisma.account.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'No bank account linked to this user.',
      });
    }

    res.status(200).json({
      success: true,
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        balance: account.balance,
        currency: account.currency,
        accountHolder: account.user.fullName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lookup recipient account holder by account number before making a transfer
 * Route: GET /api/account/lookup/:accountNumber
 */
const lookupAccount = async (req, res, next) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Account number is required.',
      });
    }

    const account = await prisma.account.findUnique({
      where: { accountNumber: accountNumber.trim() },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found with this number.',
      });
    }

    // Do not allow lookup of your own account as a recipient
    if (account.userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot transfer money to your own account number.',
      });
    }

    res.status(200).json({
      success: true,
      recipient: {
        accountNumber: account.accountNumber,
        fullName: account.user.fullName,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccountDetails,
  lookupAccount,
};

