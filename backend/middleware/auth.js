const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Expected format: "Bearer <token>"
    const decoded = jwt.verify(token.split(' ')[1] || token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
