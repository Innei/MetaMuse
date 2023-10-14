/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Page` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CommentRefTypes" AS ENUM ('Post', 'Note', 'Page', 'Recently');

-- CreateEnum
CREATE TYPE "CommentState" AS ENUM ('UNREAD', 'READ', 'SPAM');

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_categoryId_fkey";

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "Recently" (
    "id" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "refId" TEXT,
    "refType" TEXT NOT NULL,
    "up" INTEGER NOT NULL DEFAULT 0,
    "down" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Recently_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refId" TEXT,
    "author" TEXT NOT NULL,
    "mail" TEXT,
    "url" TEXT,
    "text" TEXT NOT NULL,
    "state" "CommentState" DEFAULT 'UNREAD',
    "parentId" TEXT,
    "commentsIndex" INTEGER DEFAULT 1,
    "key" TEXT,
    "IP" TEXT,
    "agent" TEXT,
    "pin" BOOLEAN DEFAULT false,
    "location" TEXT,
    "isWhispers" BOOLEAN DEFAULT false,
    "source" TEXT,
    "avatar" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
