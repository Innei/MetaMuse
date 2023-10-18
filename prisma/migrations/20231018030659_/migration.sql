/*
  Warnings:

  - Made the column `mail` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mail` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "mail" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "mail" SET NOT NULL;
