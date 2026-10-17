-- Existing assessment uploads contain Bahasa Indonesia grades.
BEGIN;
ALTER TABLE "public"."student_reports"
  ADD COLUMN IF NOT EXISTS "subjectCode" TEXT NOT NULL DEFAULT 'BI_ID',
  ADD COLUMN IF NOT EXISTS "subjectName" TEXT NOT NULL DEFAULT 'Bahasa Indonesia';
ALTER TABLE "public"."student_reports" DROP CONSTRAINT IF EXISTS "student_reports_studentId_semester_key";
DROP INDEX IF EXISTS "public"."student_reports_studentId_semester_key";
CREATE UNIQUE INDEX IF NOT EXISTS "student_reports_studentId_subjectCode_semester_key"
  ON "public"."student_reports" ("studentId", "subjectCode", "semester");
COMMIT;
