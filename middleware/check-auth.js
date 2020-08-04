const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  console.log(req.headers);
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log(req.headers.authorization);
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken);
    req.userData = { userId: decodedToken._id };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    console.log(err);
    return next(error);
  }
};
