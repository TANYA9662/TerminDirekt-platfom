// middleware/langMiddleware.js
export const langMiddleware = (req, res, next) => {
  const lang = req.query.lang || req.headers['accept-language']?.split(',')[0] || 'en';
  req.lang = lang;
  next();
};

