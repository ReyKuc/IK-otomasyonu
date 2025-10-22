function calculateAnnualEntitlement(iseBaslamaTarihi, now = new Date()) {
  const start = new Date(iseBaslamaTarihi);
  let diff = now.getFullYear() - start.getFullYear();

  // Eğer yıl farkı kadar zaman tam dolmadıysa (ay/gün olarak)
  const m1 = now.getMonth(), m2 = start.getMonth();
  const d1 = now.getDate(), d2 = start.getDate();
  if (m1 < m2 || (m1 === m2 && d1 < d2)) diff--;

  if (diff < 1) return 0;

  let total = 0;
  if (diff <= 5) {
    total = diff * 14;
  } else if (diff <= 10) {
    total = (5 * 14) + ((diff - 5) * 21);
  } else {
    total = (5 * 14) + (5 * 21) + ((diff - 10) * 30);
  }

  return total;
}
