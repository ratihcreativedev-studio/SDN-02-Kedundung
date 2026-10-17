-- Add the semester ledger without modifying existing grades or reports.
BEGIN;
CREATE TABLE IF NOT EXISTS "public"."ledger_reports" (
  "id" TEXT PRIMARY KEY,
  "classId" TEXT REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "studentId" TEXT NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "semester" TEXT NOT NULL,
  "sakit" INTEGER CHECK ("sakit" BETWEEN 0 AND 366),
  "izin" INTEGER CHECK ("izin" BETWEEN 0 AND 366),
  "alpha" INTEGER CHECK ("alpha" BETWEEN 0 AND 366),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ledger_reports_studentId_semester_key" UNIQUE ("studentId", "semester")
);
CREATE INDEX IF NOT EXISTS "ledger_reports_classId_semester_idx" ON "public"."ledger_reports" ("classId", "semester");
CREATE TABLE IF NOT EXISTS "public"."ledger_subject_grades" (
  "id" TEXT PRIMARY KEY,
  "reportId" TEXT NOT NULL REFERENCES "public"."ledger_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "score" DOUBLE PRECISION CHECK ("score" BETWEEN 0 AND 100),
  CONSTRAINT "ledger_subject_grades_reportId_code_key" UNIQUE ("reportId", "code")
);
CREATE TABLE IF NOT EXISTS "public"."ledger_extracurricular_grades" (
  "id" TEXT PRIMARY KEY,
  "reportId" TEXT NOT NULL REFERENCES "public"."ledger_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "predicate" TEXT CHECK ("predicate" IN ('SB', 'B', 'C', 'K')),
  CONSTRAINT "ledger_extracurricular_grades_reportId_code_key" UNIQUE ("reportId", "code")
);
COMMIT;
