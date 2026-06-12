-- CreateTable
CREATE TABLE "SavedCard" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cardholderName" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedCard" ADD CONSTRAINT "SavedCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
