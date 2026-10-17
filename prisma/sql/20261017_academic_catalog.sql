BEGIN;
CREATE TABLE IF NOT EXISTS "academic_items" (
  "id" TEXT PRIMARY KEY,
  "category" TEXT NOT NULL CHECK ("category" IN ('mata-pelajaran','ekstrakurikuler')),
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "academic_items_category_code_key" UNIQUE ("category", "code")
);
CREATE INDEX IF NOT EXISTS "academic_items_category_deletedAt_idx" ON "academic_items"("category", "deletedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "academic_items_active_name_key" ON "academic_items"("category", lower("name")) WHERE "deletedAt" IS NULL;
INSERT INTO "academic_items" ("id","category","code","name","updatedAt") VALUES
('catalog_mata-pelajaran_PAIDBP','mata-pelajaran','PAIDBP','Pendidikan Agama Islam dan Budi Pekerti',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_PPDK','mata-pelajaran','PPDK','Pendidikan Pancasila dan Kewarganegaraan',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_BI_ID','mata-pelajaran','BI_ID','Bahasa Indonesia',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_MU','mata-pelajaran','MU','Matematika (Umum)',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_IPADSI','mata-pelajaran','IPADSI','Ilmu Pengetahuan Alam dan Sosial (IPAS)',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_PJODK','mata-pelajaran','PJODK','Pendidikan Jasmani, Olahraga, dan Kesehatan',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_MLBD','mata-pelajaran','MLBD','Bahasa Jawa',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_SB','mata-pelajaran','SB','Seni Budaya',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_BI_EN','mata-pelajaran','BI_EN','Bahasa Inggris',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_PBP','mata-pelajaran','PBP','Pembelajaran Berbasis Projek',CURRENT_TIMESTAMP),
('catalog_mata-pelajaran_GKS','mata-pelajaran','GKS','Guru Kelas SD/MI/SLB',CURRENT_TIMESTAMP),
('catalog_ekstrakurikuler_MELUKIS','ekstrakurikuler','MELUKIS','Melukis',CURRENT_TIMESTAMP),
('catalog_ekstrakurikuler_TARI','ekstrakurikuler','TARI','Tari',CURRENT_TIMESTAMP),
('catalog_ekstrakurikuler_FUTSAL','ekstrakurikuler','FUTSAL','Futsal',CURRENT_TIMESTAMP),
('catalog_ekstrakurikuler_KARATE','ekstrakurikuler','KARATE','Karate',CURRENT_TIMESTAMP),
('catalog_ekstrakurikuler_PANTOMIM','ekstrakurikuler','PANTOMIM','Pantomim',CURRENT_TIMESTAMP),
('catalog_ekstrakurikuler_BTQ','ekstrakurikuler','BTQ','BTQ',CURRENT_TIMESTAMP),
('catalog_ekstrakurikuler_PRAMUKA','ekstrakurikuler','PRAMUKA','Pramuka',CURRENT_TIMESTAMP),
('catalog_ekstrakurikuler_BOLA_VOLI','ekstrakurikuler','BOLA_VOLI','Bola Voli',CURRENT_TIMESTAMP)
ON CONFLICT ("category","code") DO NOTHING;
COMMIT;
