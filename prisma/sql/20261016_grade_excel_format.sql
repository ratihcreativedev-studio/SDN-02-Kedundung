-- Incremental SQL for the existing database (no Prisma migration baseline).
-- Keep legacy components and score; do not infer UH/ASTS/ASAS from old grades.
BEGIN;
ALTER TABLE "public"."grades"
  ADD COLUMN IF NOT EXISTS "uh" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "asts" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "asas" DOUBLE PRECISION;
COMMIT;
