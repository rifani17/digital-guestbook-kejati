/**
 * Menghitung status agenda berdasarkan tanggal lokal hari ini.
 * @param {string} tanggal_mulai - Format 'YYYY-MM-DD'
 * @param {string} tanggal_akhir - Format 'YYYY-MM-DD'
 * @param {Date} [today] - Opsional, default new Date(). Untuk testing.
 * @returns {'akan_datang' | 'berjalan' | 'selesai'}
 */
export function calculateStatus(tanggal_mulai, tanggal_akhir, today = new Date()) {
  const todayStr = today.toLocaleDateString('sv'); // returns 'YYYY-MM-DD'

  if (todayStr < tanggal_mulai) return 'akan_datang';
  if (todayStr >= tanggal_mulai && todayStr <= tanggal_akhir) return 'berjalan';
  return 'selesai';
}
