const jwt = require('jsonwebtoken');

/**
 * Express.js Authentication Middleware
 * 
 * This middleware verifies JWT tokens from the Authorization header.
 * If valid, it attaches the decoded userId to req.userId and calls next().
 * If invalid or missing, it sends a 401 Unauthorized response.
 */
const authMiddleware = (req, res, next) => {
  try {
    // Step 1: Get the Authorization header
    const authHeader = req.headers.authorization;

    // Step 2: Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided',
        error: 'Authorization header missing or invalid format'
      });
    }

    // Step 3: Extract the token by splitting "Bearer " from the header
    const token = authHeader.split(' ')[1];

    // Validate that token exists after split
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided',
        error: 'Token is empty'
      });
    }

    // Step 4: Use jwt.verify() to decode and validate the token
    // Uses JWT_SECRET from environment variables
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret);

    // Step 5: Verify that userId exists in decoded token
    if (!decoded.userId) {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'Token does not contain userId'
      });
    }

    // Step 6: Attach the decoded userId to the request object
    req.userId = decoded.userId;

    // Step 7: Call next() to pass control to the next middleware/route
    next();

  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: error.message
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token has expired',
        error: error.message
      });
    } else {
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        error: error.message
      });
    }
  }
};

module.exports = authMiddleware;
