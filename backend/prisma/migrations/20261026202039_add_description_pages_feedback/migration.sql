-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "description" TEXT,
ADD COLUMN     "pages" INTEGER;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "description" TEXT,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_bookId_idx" ON "Feedback"("bookId");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
