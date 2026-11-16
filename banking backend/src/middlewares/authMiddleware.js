const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Middleware to verify JWT token and attach user to request object
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Fetch user with account details from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        account: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.',
      });
    }

    // Attach user (without password) to request
    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      account: user.account,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

module.exports = { verifyToken };

