const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Yetki tokeni gerekli' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token bulunamadı' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Yetersiz yetki' });
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz token' });
  }
}

module.exports = { verifyAdmin };
