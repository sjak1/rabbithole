-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
