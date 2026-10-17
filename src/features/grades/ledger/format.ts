export const ledgerSubjects = [
  ['PAIDBP', 'Pendidikan Agama Islam dan Budi Pekerti', 'PAIDBP'],
  ['PPDK', 'Pendidikan Pancasila dan Kewarganegaraan', 'PPDK'],
  ['BI_ID', 'Bahasa Indonesia', 'BI'],
  ['MU', 'Matematika (Umum)', 'MU'],
  ['IPADSI', 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', 'IPADSI'],
  ['PJODK', 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 'PJODK'],
  ['MLBD', 'Bahasa Jawa', 'MLBD'],
  ['SB', 'Seni Budaya', 'SB'],
  ['BI_EN', 'Bahasa Inggris', 'BI'],
  ['PBP', 'Pembelajaran Berbasis Projek', 'PBP'],
  ['GKS', 'Guru Kelas SD/MI/SLB', 'GKS'],
] as const
export const ledgerActivities = ['Melukis', 'Tari', 'Futsal', 'Karate', 'Pantomim', 'BTQ', 'Pramuka', 'Bola Voli'] as const
export type LedgerCategory = 'mata-pelajaran' | 'ekstrakurikuler'
