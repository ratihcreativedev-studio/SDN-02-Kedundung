-- Annual Excel recaps. Existing monthly attendances remain unchanged.
BEGIN;
CREATE TABLE IF NOT EXISTS "public"."attendance_recaps" (
  "id" TEXT PRIMARY KEY,
  "classId" TEXT REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "studentId" TEXT NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "academicYear" TEXT NOT NULL,
  "hadir" INTEGER NOT NULL CHECK ("hadir" >= 0),
  "sakit" INTEGER NOT NULL CHECK ("sakit" >= 0),
  "izin" INTEGER NOT NULL CHECK ("izin" >= 0),
  "alpha" INTEGER NOT NULL CHECK ("alpha" >= 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "attendance_recaps_studentId_academicYear_key" UNIQUE ("studentId", "academicYear")
);
CREATE INDEX IF NOT EXISTS "attendance_recaps_classId_academicYear_idx" ON "public"."attendance_recaps" ("classId", "academicYear");
ALTER TABLE "public"."attendance_recaps" ENABLE ROW LEVEL SECURITY;
COMMIT;
