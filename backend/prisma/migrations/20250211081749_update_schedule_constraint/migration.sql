/*
  Warnings:

  - A unique constraint covering the columns `[practicumId,assistantId,groupId]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'TIDAK_HADIR');

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'FINISHED';

-- DropIndex
DROP INDEX "Schedule_groupId_startTime_key";

-- CreateTable
CREATE TABLE "AttendanceCode" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "codeId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'TIDAK_HADIR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceCode_code_key" ON "AttendanceCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceCode_scheduleId_expiredAt_key" ON "AttendanceCode"("scheduleId", "expiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_codeId_userId_key" ON "Attendance"("codeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_practicumId_assistantId_groupId_key" ON "Schedule"("practicumId", "assistantId", "groupId");

-- AddForeignKey
ALTER TABLE "AttendanceCode" ADD CONSTRAINT "AttendanceCode_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "AttendanceCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
