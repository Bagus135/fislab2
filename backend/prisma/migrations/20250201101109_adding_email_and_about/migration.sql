/*
  Warnings:

  - Added the required column `about` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "about" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL;
