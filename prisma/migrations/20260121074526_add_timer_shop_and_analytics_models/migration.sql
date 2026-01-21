-- CreateTable
CREATE TABLE "Timer" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subheading" TEXT,
    "endDate" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringConfig" JSONB,
    "daysLabel" TEXT NOT NULL DEFAULT 'Days',
    "hoursLabel" TEXT NOT NULL DEFAULT 'Hrs',
    "minutesLabel" TEXT NOT NULL DEFAULT 'Mins',
    "secondsLabel" TEXT NOT NULL DEFAULT 'Secs',
    "timerType" TEXT NOT NULL DEFAULT 'countdown',
    "fixedMinutes" INTEGER,
    "startsAt" TIMESTAMP(3),
    "onExpiry" TEXT NOT NULL DEFAULT 'unpublish',
    "ctaType" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "designConfig" JSONB NOT NULL DEFAULT '{}',
    "placementConfig" JSONB NOT NULL DEFAULT '{}',
    "productSelection" TEXT NOT NULL DEFAULT 'all',
    "selectedProducts" JSONB,
    "selectedCollections" JSONB,
    "excludedProducts" JSONB,
    "productTags" JSONB,
    "pageSelection" TEXT,
    "excludedPages" JSONB,
    "geolocation" TEXT NOT NULL DEFAULT 'all-world',
    "countries" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "currentPlan" TEXT NOT NULL DEFAULT 'free',
    "planStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionId" TEXT,
    "monthlyViews" INTEGER NOT NULL DEFAULT 0,
    "viewsResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingStatus" TEXT NOT NULL DEFAULT 'active',
    "trialEndsAt" TIMESTAMP(3),
    "settings" JSONB,
    "shopName" TEXT,
    "email" TEXT,
    "currency" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerView" (
    "id" TEXT NOT NULL,
    "timerId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "visitorId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "pageUrl" TEXT,
    "pageType" TEXT,
    "productId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimerView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Timer_shop_idx" ON "Timer"("shop");

-- CreateIndex
CREATE INDEX "Timer_shop_isPublished_idx" ON "Timer"("shop", "isPublished");

-- CreateIndex
CREATE INDEX "Timer_shop_isActive_idx" ON "Timer"("shop", "isActive");

-- CreateIndex
CREATE INDEX "Timer_type_idx" ON "Timer"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopDomain_key" ON "Shop"("shopDomain");

-- CreateIndex
CREATE INDEX "Shop_shopDomain_idx" ON "Shop"("shopDomain");

-- CreateIndex
CREATE INDEX "Shop_currentPlan_idx" ON "Shop"("currentPlan");

-- CreateIndex
CREATE INDEX "Shop_billingStatus_idx" ON "Shop"("billingStatus");

-- CreateIndex
CREATE INDEX "TimerView_timerId_idx" ON "TimerView"("timerId");

-- CreateIndex
CREATE INDEX "TimerView_shop_idx" ON "TimerView"("shop");

-- CreateIndex
CREATE INDEX "TimerView_viewedAt_idx" ON "TimerView"("viewedAt");

-- CreateIndex
CREATE INDEX "TimerView_timerId_viewedAt_idx" ON "TimerView"("timerId", "viewedAt");
