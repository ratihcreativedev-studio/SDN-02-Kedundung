-- Rapor-only imports do not supply assessment components.
BEGIN;
ALTER TABLE "public"."student_reports"
  ALTER COLUMN "uh" DROP NOT NULL,
  ALTER COLUMN "asts" DROP NOT NULL,
  ALTER COLUMN "asas" DROP NOT NULL;
COMMIT;
