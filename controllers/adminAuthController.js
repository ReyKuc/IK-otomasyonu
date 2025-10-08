const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin zaten var' });

    const admin = await Admin.create({ email, password });
    res.status(201).json({ message: 'Admin oluşturuldu', admin });
  } catch (err) {
    res.status(500).json({ message: 'Hata', error: err.message });
  }
};


const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin bulunamadı' });

    const valid = await admin.matchPassword(password);
    if (!valid) return res.status(401).json({ message: 'Şifre yanlış' });

    const token = jwt.sign(
      { id: admin._id, role: 'admin', email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Giriş başarılı', token });
  } catch (err) {
    res.status(500).json({ message: 'Hata', error: err.message });
  }
};

module.exports = { registerAdmin, loginAdmin };
