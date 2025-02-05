/*
  Warnings:

  - You are about to drop the column `asistantId` on the `Group` table. All the data in the column will be lost.
  - You are about to alter the column `practicumId` on the `Group` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to drop the column `asistantId` on the `Schedule` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assistantId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assistantId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_asistantId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_practicumId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_asistantId_fkey";

-- DropIndex
DROP INDEX "Group_asistantId_idx";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "asistantId",
ADD COLUMN     "assistantId" TEXT NOT NULL,
ALTER COLUMN "practicumId" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "asistantId",
ADD COLUMN     "assistantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE INDEX "Group_assistantId_idx" ON "Group"("assistantId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_practicumId_fkey" FOREIGN KEY ("practicumId") REFERENCES "practicums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
