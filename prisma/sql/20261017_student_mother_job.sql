-- Optional field for existing and newly created student records.
ALTER TABLE "public"."students" ADD COLUMN IF NOT EXISTS "motherJob" TEXT;
