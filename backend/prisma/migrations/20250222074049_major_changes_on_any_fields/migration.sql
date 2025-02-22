/*
  Warnings:

  - You are about to drop the column `inlab` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the column `prelab` on the `Grade` table. All the data in the column will be lost.
  - The primary key for the `practicums` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `PasswordReset` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `practicums` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_userId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_practicumId_fkey";

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "inlab",
DROP COLUMN "prelab",
ADD COLUMN     "dataProcessing" SMALLINT,
ADD COLUMN     "oralTest" SMALLINT,
ADD COLUMN     "preExam" SMALLINT,
ADD COLUMN     "punctuality" SMALLINT,
ADD COLUMN     "skillsAndAttitude" SMALLINT;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "week" SMALLINT,
ALTER COLUMN "practicumId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "about" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "practicums" DROP CONSTRAINT "practicums_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "practicums_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "practicums_id_seq";

-- DropTable
DROP TABLE "PasswordReset";

-- CreateIndex
CREATE UNIQUE INDEX "practicums_id_key" ON "practicums"("id");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_practicumId_fkey" FOREIGN KEY ("practicumId") REFERENCES "practicums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
