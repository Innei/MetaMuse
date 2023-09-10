/*
  Warnings:

  - You are about to drop the column `related_by_id` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_related_by_id_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "related_by_id";

-- CreateTable
CREATE TABLE "_RelatedPosts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RelatedPosts_AB_unique" ON "_RelatedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_RelatedPosts_B_index" ON "_RelatedPosts"("B");

-- AddForeignKey
ALTER TABLE "_RelatedPosts" ADD CONSTRAINT "_RelatedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedPosts" ADD CONSTRAINT "_RelatedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
