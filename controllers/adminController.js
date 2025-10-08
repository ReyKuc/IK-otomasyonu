

const Personnel = require('../models/Personnel');
const Leave = require('../models/Leave');


function daysBetween(start, end) {
  const diff = Math.abs(new Date(end) - new Date(start));
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}


function calculateAnnualEntitlement(startDate, currentDate = new Date()) {
  const years = currentDate.getFullYear() - new Date(startDate).getFullYear();
  if (years < 1) return 0;
  if (years < 5) return 14;
  if (years < 10) return 21;
  return 30;
}


async function getAllPersonnels(req, res) {
  try {
    const personnels = await Personnel.find();
    return res.json(personnels);
  } catch (err) {
    return res.status(500).json({ message: 'Veri alınamadı', error: err.message });
  }
}


async function addPersonnel(req, res) {
  try {
    const data = req.body;
    const newPersonnel = await Personnel.create(data);
    return res.status(201).json({ message: 'Personel eklendi', newPersonnel });
  } catch (err) {
    return res.status(400).json({ message: 'Personel eklenemedi', error: err.message });
  }
}


async function deletePersonnel(req, res) {
  try {
    const { id } = req.params;
    await Personnel.findByIdAndDelete(id);
    return res.json({ message: 'Personel silindi' });
  } catch (err) {
    return res.status(400).json({ message: 'Silme hatası', error: err.message });
  }
}


async function updatePersonnel(req, res) {
  try {
    const { id } = req.params;
    const updated = await Personnel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Personel bulunamadı' });
    return res.json({ message: 'Personel güncellendi', updated });
  } catch (err) {
    return res.status(400).json({ message: 'Güncelleme hatası', error: err.message });
  }
}


async function addLeave(req, res) {
  try {
    const { personnelId, tip, baslangic, bitis } = req.body;

    const personnel = await Personnel.findById(personnelId);
    if (!personnel) return res.status(404).json({ message: 'Personel bulunamadı' });

    const gunSayisi = daysBetween(baslangic, bitis);

    
    if (tip === 'rapor') {
      const usedRapor = await Leave.aggregate([
        { $match: { personnel: personnel._id, tip: 'rapor' } },
        { $group: { _id: null, total: { $sum: '$gunSayisi' } } }
      ]);
      const used = usedRapor[0]?.total || 0;
      if (used + gunSayisi > 40) {
        return res.status(400).json({ message: `Rapor toplamı 40 günü geçemez. Kalan: ${40 - used} gün` });
      }
    }

    
    if (tip === 'yillik') {
      const hak = calculateAnnualEntitlement(personnel.iseBaslamaTarihi);
      const usedAnnual = await Leave.aggregate([
        { $match: { personnel: personnel._id, tip: 'yillik' } },
        { $group: { _id: null, total: { $sum: '$gunSayisi' } } }
      ]);
      const used = usedAnnual[0]?.total || 0;
      if (used + gunSayisi > hak) {
        return res.status(400).json({ message: `Yıllık izin hakkı aşılamaz. Kalan: ${hak - used} gün` });
      }
    }

    const leave = await Leave.create({
      personnel: personnel._id,
      tip,
      baslangic,
      bitis,
      gunSayisi,
      islemeAlindi: true,
      islemTarihi: new Date(),
      islemBy: req.admin.email
    });

    return res.status(201).json({ message: 'İzin eklendi', leave });
  } catch (err) {
    return res.status(400).json({ message: 'Hata', error: err.message });
  }
}


async function updateLeave(req, res) {
  try {
    const { leaveId } = req.params;
    const { baslangic, bitis, tip } = req.body;
    const gunSayisi = daysBetween(baslangic, bitis);
    const updated = await Leave.findByIdAndUpdate(
      leaveId,
      { baslangic, bitis, tip, gunSayisi, islemeAlindi: true, islemTarihi: new Date(), islemBy: req.admin.email },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'İzin bulunamadı' });
    return res.json({ message: 'Güncellendi', leave: updated });
  } catch (err) {
    return res.status(400).json({ message: 'Güncelleme hatası', error: err.message });
  }
}


async function deleteLeave(req, res) {
  try {
    const { leaveId } = req.params;
    await Leave.findByIdAndDelete(leaveId);
    return res.json({ message: 'İzin silindi' });
  } catch (err) {
    return res.status(400).json({ message: 'Silme hatası', error: err.message });
  }
}


async function dashboard(req, res) {
  try {
    const personnelList = await Personnel.find();
    const result = [];
    const now = new Date();

    for (const p of personnelList) {
      const totalYillikHak = calculateAnnualEntitlement(p.iseBaslamaTarihi, now);

      
      const yillikKullanilanAgg = await Leave.aggregate([
        { $match: { personnel: p._id, tip: 'yillik' } },
        { $group: { _id: null, total: { $sum: '$gunSayisi' } } }
      ]);
      const yillikKullanilan = yillikKullanilanAgg[0]?.total || 0;

      
      const raporAgg = await Leave.aggregate([
        { $match: { personnel: p._id, tip: 'rapor' } },
        { $group: { _id: null, total: { $sum: '$gunSayisi' } } }
      ]);
      const raporKullanilan = raporAgg[0]?.total || 0;
      const kalanRapor = 40 - raporKullanilan;

      
      const ucretliAgg = await Leave.aggregate([
        { $match: { personnel: p._id, tip: 'ucretli' } },
        { $group: { _id: null, total: { $sum: '$gunSayisi' } } }
      ]);
      const ucretliKullanilan = ucretliAgg[0]?.total || 0;

      const ucretsizAgg = await Leave.aggregate([
        { $match: { personnel: p._id, tip: 'ucretsiz' } },
        { $group: { _id: null, total: { $sum: '$gunSayisi' } } }
      ]);
      const ucretsizKullanilan = ucretsizAgg[0]?.total || 0;

      result.push({
        adSoyad: `${p.isim} ${p.soyisim}`,
        toplamYillikHak: totalYillikHak,
        kullandigiYillik: yillikKullanilan,
        kalanYillik: totalYillikHak - yillikKullanilan,
        kullandigiRapor: raporKullanilan,
        kalanRapor,
        kullandigiUcretli: ucretliKullanilan,
        kullandigiUcretsiz: ucretsizKullanilan
      });
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Dashboard hatası', error: err.message });
  }
}

module.exports = {
  getAllPersonnels,
  addPersonnel,
  deletePersonnel,
  updatePersonnel,
  addLeave,
  updateLeave,
  deleteLeave,
  dashboard
};
