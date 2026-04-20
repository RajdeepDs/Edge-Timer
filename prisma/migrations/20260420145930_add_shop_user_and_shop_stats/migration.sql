-- CreateTable
CREATE TABLE "ShopUser" (
    "id" TEXT NOT NULL,
    "shopifyUserId" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "loginCount" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopStats" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "totalTimersCreated" INTEGER NOT NULL DEFAULT 0,
    "activeTimerCount" INTEGER NOT NULL DEFAULT 0,
    "publishedTimerCount" INTEGER NOT NULL DEFAULT 0,
    "totalViewsAllTime" INTEGER NOT NULL DEFAULT 0,
    "peakMonthlyViews" INTEGER NOT NULL DEFAULT 0,
    "lastTimerCreatedAt" TIMESTAMP(3),
    "lastViewAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopUser_shopifyUserId_key" ON "ShopUser"("shopifyUserId");

-- CreateIndex
CREATE INDEX "ShopUser_shopDomain_idx" ON "ShopUser"("shopDomain");

-- CreateIndex
CREATE INDEX "ShopUser_shopifyUserId_idx" ON "ShopUser"("shopifyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopStats_shopDomain_key" ON "ShopStats"("shopDomain");

-- CreateIndex
CREATE INDEX "ShopStats_shopDomain_idx" ON "ShopStats"("shopDomain");
