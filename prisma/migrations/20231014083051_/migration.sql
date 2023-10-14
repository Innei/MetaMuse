/*
  Warnings:

  - You are about to drop the column `IP` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `commentsIndex` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `isWhispers` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `refId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `ref_id` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ref_type` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "IP",
DROP COLUMN "commentsIndex",
DROP COLUMN "isWhispers",
DROP COLUMN "refId",
ADD COLUMN     "comments_index" INTEGER DEFAULT 1,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "is_whispers" BOOLEAN DEFAULT false,
ADD COLUMN     "ref_id" TEXT NOT NULL,
ADD COLUMN     "ref_type" "CommentRefTypes" NOT NULL;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "comments_index" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "comments_index" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "comments_index" INTEGER NOT NULL DEFAULT 1;
