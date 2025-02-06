/*
  Warnings:

  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `groupId` on the `Group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_groupId_fkey";

-- DropForeignKey
ALTER TABLE "_MemberGroups" DROP CONSTRAINT "_MemberGroups_A_fkey";

-- DropIndex
DROP INDEX "Group_groupId_key";

-- AlterTable
ALTER TABLE "Group" DROP CONSTRAINT "Group_pkey",
DROP COLUMN "groupId",
ADD COLUMN     "id" VARCHAR(100) NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Group_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Group_id_key" ON "Group"("id");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberGroups" ADD CONSTRAINT "_MemberGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
