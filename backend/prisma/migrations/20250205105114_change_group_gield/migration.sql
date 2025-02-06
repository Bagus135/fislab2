/*
  Warnings:

  - You are about to drop the column `assistantId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `practicumId` on the `Group` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_assistantId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_practicumId_fkey";

-- DropIndex
DROP INDEX "Group_assistantId_idx";

-- DropIndex
DROP INDEX "Group_name_key";

-- DropIndex
DROP INDEX "Group_practicumId_idx";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "assistantId",
DROP COLUMN "practicumId",
ALTER COLUMN "name" SET DATA TYPE TEXT;
