-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT NOT NULL DEFAULT '',
    "shippingFee" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
