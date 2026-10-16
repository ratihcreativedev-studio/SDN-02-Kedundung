-- Keep the class at the time of upload, even after a student changes class.
BEGIN;
ALTER TABLE "public"."student_reports" ADD COLUMN IF NOT EXISTS "classId" TEXT
  REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
UPDATE "public"."student_reports" r SET "classId" = s."classId"
FROM "public"."students" s WHERE r."studentId" = s."id" AND r."classId" IS NULL;
CREATE INDEX IF NOT EXISTS "student_reports_classId_semester_idx"
  ON "public"."student_reports" ("classId", "semester");
COMMIT;
