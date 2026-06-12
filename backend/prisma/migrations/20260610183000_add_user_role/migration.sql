-- Add a public/mobile user role.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';

-- Bring older databases in line with the current Prisma schema.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "districtId" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;

ALTER TABLE "FineCategory" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'SUCCESS';

ALTER TABLE "SMSLog" ADD COLUMN IF NOT EXISTS "officerPhone" TEXT;
UPDATE "SMSLog" SET "officerPhone" = "phone" WHERE "officerPhone" IS NULL AND "phone" IS NOT NULL;
ALTER TABLE "SMSLog" ALTER COLUMN "officerPhone" SET NOT NULL;
ALTER TABLE "SMSLog" DROP COLUMN IF EXISTS "phone";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'User_districtId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_districtId_fkey"
      FOREIGN KEY ("districtId") REFERENCES "District"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
