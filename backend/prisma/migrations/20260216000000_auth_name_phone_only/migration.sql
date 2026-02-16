-- Backfill name and phone for existing rows (use email or id so we have unique phone)
UPDATE "User" SET "name" = COALESCE("name", "email", 'User'), "phone" = COALESCE("phone", "id") WHERE "name" IS NULL OR "phone" IS NULL;

-- Drop old unique and columns
DROP INDEX IF EXISTS "User_email_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "email";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";

-- Enforce not null
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;

-- Unique phone (required for login lookup)
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
