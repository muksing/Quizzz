-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentType" ADD VALUE 'MATCHING';
ALTER TYPE "ContentType" ADD VALUE 'GROUPING';
ALTER TYPE "ContentType" ADD VALUE 'ORDERING';

-- AlterEnum
ALTER TYPE "GameType" ADD VALUE 'GESTURE';

-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "activityData" JSONB;
