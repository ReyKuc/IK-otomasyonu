const mongoose = require('mongoose');
const { type } = require('os');

const PersonnelSchema = new mongoose.Schema({
  isim: { type: String, required: true },
  soyisim: { type: String, required: true },
  kimlikNo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefon: { type: String },
  unvan: { type: String },
  birim: { type: String },
  dogumTarihi: { type: Date },
  cinsiyet: { type: String },
  universite: { type: String },
  bolum: { type: String },
  ehliyet: { type: String },
  adres: { type: String },
  medeniDurum: { type: String },
  iseBaslamaTarihi: { type: Date, required: true },
}, 
{ timestamps: true });

module.exports = mongoose.model('Personnel', PersonnelSchema);
