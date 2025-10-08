function calculateAnnualEntitlement(iseBaslamaTarihi, now = new Date()) {
  const diff = now.getFullYear() - iseBaslamaTarihi.getFullYear();
  if (diff < 1) return 0;
  if (diff >= 1 && diff < 5) return 14;
  if (diff >= 5 && diff < 10) return 21;
  return 30;
}

function daysBetween(start, end) {
  const diffTime = new Date(end) - new Date(start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

module.exports = { calculateAnnualEntitlement, daysBetween };
