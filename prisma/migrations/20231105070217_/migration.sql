/*
  Warnings:

  - The primary key for the `ConfigKV` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "ConfigKV_key_key";

-- AlterTable
ALTER TABLE "ConfigKV" DROP CONSTRAINT "ConfigKV_pkey",
ADD COLUMN     "id" TEXT NOT NULL DEFAULT '',
ADD CONSTRAINT "ConfigKV_pkey" PRIMARY KEY ("id");
