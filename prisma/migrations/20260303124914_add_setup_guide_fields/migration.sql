-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "embedActivated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstTimerCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "setupDismissed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timerConfirmedWorking" BOOLEAN NOT NULL DEFAULT false;
