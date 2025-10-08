const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  personnel: { type: mongoose.Schema.Types.ObjectId, ref: 'Personnel', required: true },
  tip: { type: String, enum: ['yillik', 'rapor', 'ucretli', 'ucretsiz'], required: true },
  baslangic: { type: Date, required: true },
  bitis: { type: Date, required: true },
  gunSayisi: { type: Number, required: true },
  islemeAlindi: { type: Boolean, default: false },
  islemTarihi: Date,
  islemBy: String,
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
