-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_topicId_fkey";

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "NoteTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
