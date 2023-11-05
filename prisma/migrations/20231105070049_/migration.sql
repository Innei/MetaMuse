/*
  Warnings:

  - The primary key for the `ConfigKV` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ConfigKV` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConfigKV" DROP CONSTRAINT "ConfigKV_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ConfigKV_pkey" PRIMARY KEY ("key");
