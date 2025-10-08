
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Admin = require('../models/adminModel');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB bağlantısı başarılı"))
  .catch(err => console.log("MongoDB bağlantı hatası", err));

async function createAdmin() {
  try {
    const existing = await Admin.findOne({ email: 'admin@ik.com' });
    if (existing) {
      console.log('Admin zaten mevcut');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new Admin({
      isim: 'Admin',
      soyisim: 'IK',
      email: 'admin@ik.com',
      sifre: hashedPassword
    });

    await admin.save();
    console.log('Admin oluşturuldu: admin@ik.com / admin123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
