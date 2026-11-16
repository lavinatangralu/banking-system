const prisma = require('../config/prisma');

/**
 * Deposit funds into user's account
 * Route: POST /api/transactions/deposit
 */
const deposit = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Deposit amount must be a positive number.',
      });
    }

    const userAccount = await prisma.account.findUnique({
      where: { userId: req.user.id },
    });

    if (!userAccount) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    // Perform deposit in an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update balance
      const updatedAccount = await tx.account.update({
        where: { id: userAccount.id },
        data: {
          balance: { increment: numericAmount },
        },
      });

      // 2. Create Transaction log
      const txLog = await tx.transaction.create({
        data: {
          amount: numericAmount,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          description: description || 'Self Cash Deposit',
          receiverAccountId: userAccount.id,
        },
      });

      return { updatedAccount, txLog };
    });

    res.status(200).json({
      success: true,
      message: `Successfully deposited $${numericAmount.toFixed(2)}`,
      balance: result.updatedAccount.balance,
      transaction: result.txLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw funds from user's account
 * Route: POST /api/transactions/withdraw
 */
const withdraw = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal amount must be a positive number.',
      });
    }

    const userAccount = await prisma.account.findUnique({
      where: { userId: req.user.id },
    });

    if (!userAccount) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    // Check if sufficient balance
    if (parseFloat(userAccount.balance) < numericAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Your current balance is $${userAccount.balance}.`,
      });
    }

    // Perform withdrawal in an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.account.update({
        where: { id: userAccount.id },
        data: {
          balance: { decrement: numericAmount },
        },
      });

      const txLog = await tx.transaction.create({
        data: {
          amount: numericAmount,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          description: description || 'ATM / Cash Withdrawal',
          senderAccountId: userAccount.id,
        },
      });

      return { updatedAccount, txLog };
    });

    res.status(200).json({
      success: true,
      message: `Successfully withdrew $${numericAmount.toFixed(2)}`,
      balance: result.updatedAccount.balance,
      transaction: result.txLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transfer funds from sender to recipient using ACID Database Transaction
 * Route: POST /api/transactions/transfer
 */
const transfer = async (req, res, next) => {
  try {
    const { recipientAccountNumber, amount, description } = req.body;
    const numericAmount = parseFloat(amount);

    if (!recipientAccountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Recipient account number is required.',
      });
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transfer amount must be a positive number.',
      });
    }

    // Fetch sender account
    const senderAccount = await prisma.account.findUnique({
      where: { userId: req.user.id },
    });

    if (!senderAccount) {
      return res.status(404).json({ success: false, message: 'Sender account not found.' });
    }

    // Check self-transfer
    if (senderAccount.accountNumber === recipientAccountNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot transfer funds to your own account.',
      });
    }

    // Check sender balance
    if (parseFloat(senderAccount.balance) < numericAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: $${senderAccount.balance}`,
      });
    }

    // Fetch recipient account
    const recipientAccount = await prisma.account.findUnique({
      where: { accountNumber: recipientAccountNumber.trim() },
      include: {
        user: { select: { fullName: true } },
      },
    });

    if (!recipientAccount) {
      return res.status(404).json({
        success: false,
        message: 'Recipient account not found. Please verify the account number.',
      });
    }

    // ACID PostgreSQL Transaction: Deduct sender, credit recipient, record transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct sender
      const updatedSender = await tx.account.update({
        where: { id: senderAccount.id },
        data: {
          balance: { decrement: numericAmount },
        },
      });

      // 2. Credit recipient
      await tx.account.update({
        where: { id: recipientAccount.id },
        data: {
          balance: { increment: numericAmount },
        },
      });

      // 3. Create Transfer record
      const transferRecord = await tx.transaction.create({
        data: {
          amount: numericAmount,
          type: 'TRANSFER',
          status: 'COMPLETED',
          description: description || `Transfer to ${recipientAccount.user.fullName}`,
          senderAccountId: senderAccount.id,
          receiverAccountId: recipientAccount.id,
        },
      });

      return {
        updatedSender,
        transferRecord,
        recipientName: recipientAccount.user.fullName,
      };
    });

    res.status(200).json({
      success: true,
      message: `Successfully transferred $${numericAmount.toFixed(2)} to ${result.recipientName}`,
      newBalance: result.updatedSender.balance,
      transaction: result.transferRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions for the logged-in user's account
 * Route: GET /api/transactions/history
 */
const getHistory = async (req, res, next) => {
  try {
    const userAccount = await prisma.account.findUnique({
      where: { userId: req.user.id },
    });

    if (!userAccount) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    // Fetch transactions where user is either sender or receiver
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderAccountId: userAccount.id },
          { receiverAccountId: userAccount.id },
        ],
      },
      include: {
        senderAccount: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        receiverAccount: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format transaction list to indicate credit vs debit relative to current user
    const formatted = transactions.map((t) => {
      const isCredit = t.receiverAccountId === userAccount.id;
      let counterparty = 'Self';

      if (t.type === 'TRANSFER') {
        if (isCredit) {
          counterparty = t.senderAccount ? t.senderAccount.user.fullName : 'External Sender';
        } else {
          counterparty = t.receiverAccount ? t.receiverAccount.user.fullName : 'External Receiver';
        }
      } else if (t.type === 'DEPOSIT') {
        counterparty = 'Deposit Terminal';
      } else if (t.type === 'WITHDRAWAL') {
        counterparty = 'ATM Withdrawal';
      }

      return {
        id: t.id,
        amount: t.amount,
        type: t.type,
        direction: isCredit ? 'CREDIT' : 'DEBIT',
        status: t.status,
        description: t.description,
        counterparty,
        createdAt: t.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      transactions: formatted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deposit,
  withdraw,
  transfer,
  getHistory,
};

