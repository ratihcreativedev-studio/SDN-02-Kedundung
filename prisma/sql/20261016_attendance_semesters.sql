-- Run after 20261016_attendance_recaps.sql.
-- Only the confirmed Kelas 2 2025/2026 import is assigned to Ganjil.
BEGIN;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'attendance_recaps' AND column_name = 'academicYear') THEN
    IF EXISTS (
      SELECT 1 FROM "public"."attendance_recaps" a
      LEFT JOIN "public"."classes" c ON c.id = a."classId"
      WHERE a."academicYear" <> '2025/2026' OR c.name IS DISTINCT FROM 'Kelas 2'
    ) THEN
      RAISE EXCEPTION 'Other annual attendance recaps need an explicit semester assignment before migration';
    END IF;
    ALTER TABLE "public"."attendance_recaps" RENAME COLUMN "academicYear" TO "semester";
    UPDATE "public"."attendance_recaps" SET "semester" = 'Ganjil 2025/2026', "updatedAt" = CURRENT_TIMESTAMP
      WHERE "semester" = '2025/2026';
    ALTER TABLE "public"."attendance_recaps" RENAME CONSTRAINT "attendance_recaps_studentId_academicYear_key" TO "attendance_recaps_studentId_semester_key";
    ALTER INDEX "public"."attendance_recaps_classId_academicYear_idx" RENAME TO "attendance_recaps_classId_semester_idx";
  END IF;
END $$;
COMMIT;
