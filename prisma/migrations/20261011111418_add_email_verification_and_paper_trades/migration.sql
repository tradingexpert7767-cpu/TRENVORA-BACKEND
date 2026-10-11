-- CreateEnum
CREATE TYPE "TradeInstrument" AS ENUM ('NIFTY', 'BANK_NIFTY', 'SENSEX');

-- CreateEnum
CREATE TYPE "InstrumentType" AS ENUM ('SPOT', 'OPTION');

-- CreateEnum
CREATE TYPE "TradeSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TradeEmotion" AS ENUM ('Calm', 'Confident', 'Fearful', 'FOMO', 'Revenge', 'Uncertain');

-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('CE', 'PE');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_trades" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "instrument" "TradeInstrument" NOT NULL,
    "instrument_type" "InstrumentType" NOT NULL,
    "side" "TradeSide" NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "quantity" INTEGER NOT NULL,
    "entry_price" DECIMAL(12,2) NOT NULL,
    "exit_price" DECIMAL(12,2),
    "stop_loss" DECIMAL(12,2),
    "target" DECIMAL(12,2),
    "pnl" DECIMAL(12,2),
    "thesis" TEXT,
    "emotion" "TradeEmotion",
    "option_type" "OptionType",
    "strike" DECIMAL(10,2),
    "expiry" TEXT,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paper_trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otp_codes_user_id_idx" ON "otp_codes"("user_id");

-- CreateIndex
CREATE INDEX "paper_trades_user_id_idx" ON "paper_trades"("user_id");

-- CreateIndex
CREATE INDEX "paper_trades_user_id_status_idx" ON "paper_trades"("user_id", "status");

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_trades" ADD CONSTRAINT "paper_trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
