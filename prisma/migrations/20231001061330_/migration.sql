/*
  Warnings:

  - You are about to drop the `PostImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostImage" DROP CONSTRAINT "PostImage_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "images" JSONB NOT NULL DEFAULT '[]';

-- DropTable
DROP TABLE "PostImage";
