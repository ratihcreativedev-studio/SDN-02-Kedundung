-- Subject-independent Excel reports. Keep historical subject grades intact.
BEGIN;
CREATE TABLE IF NOT EXISTS "public"."student_reports" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "semester" TEXT NOT NULL,
  "uh" DOUBLE PRECISION NOT NULL,
  "asts" DOUBLE PRECISION NOT NULL,
  "asas" DOUBLE PRECISION NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_reports_studentId_semester_key" UNIQUE ("studentId", "semester")
);
-- Copy only unambiguous reports already imported using the new Excel components.
-- Conflicting reports require re-upload; never average subject grades into a report.
INSERT INTO "public"."student_reports" ("id", "studentId", "semester", "uh", "asts", "asas", "score", "createdAt", "updatedAt")
SELECT 'report_' || MIN("id"), "studentId", "semester", MIN("uh"), MIN("asts"), MIN("asas"), MIN("score"), MIN("createdAt"), MAX("updatedAt")
FROM "public"."grades"
WHERE "uh" IS NOT NULL AND "asts" IS NOT NULL AND "asas" IS NOT NULL
GROUP BY "studentId", "semester"
HAVING COUNT(DISTINCT ("uh", "asts", "asas", "score")) = 1
ON CONFLICT ("studentId", "semester") DO NOTHING;
COMMIT;
