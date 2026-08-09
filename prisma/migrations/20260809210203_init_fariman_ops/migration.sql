-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ceo', 'warehouse_manager', 'operator', 'admin');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('internal_only', 'matched_in_enekas', 'voided');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "TradeSide" AS ENUM ('buy', 'sell', 'both');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "lastSuccess" TIMESTAMP(3),
    "lastAttempt" TIMESTAMP(3),
    "lastError" TEXT,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnekasPartner" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "groupCode" TEXT,
    "groupTitle" TEXT,
    "typeTitle" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "level" TEXT,
    "mobile" TEXT,
    "raw" JSONB,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnekasPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnekasAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT,
    "type" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "raw" JSONB,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnekasAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnekasArticle" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT,
    "invoiceNumber" TEXT,
    "invoiceDate" TEXT,
    "invoiceType" TEXT,
    "invoiceStatus" TEXT,
    "accountCode" TEXT,
    "accountTitle" TEXT,
    "partnerId" TEXT,
    "partnerCode" TEXT,
    "partnerTitle" TEXT,
    "description" TEXT,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "count" DOUBLE PRECISION,
    "branchTitle" TEXT,
    "raw" JSONB,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnekasArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnekasStore" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "branchTitle" TEXT,
    "storekeeper" TEXT,
    "raw" JSONB,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnekasStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'عدد',
    "section" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAlias" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "side" "TradeSide" NOT NULL DEFAULT 'both',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceDay" (
    "id" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentObligation" (
    "id" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseCount" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyWarehouseRow" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "opening" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purchase" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sale" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "systemBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "warehouseBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "variance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyWarehouseRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColdroomLot" (
    "id" TEXT NOT NULL,
    "storeCode" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "enteredOn" TEXT NOT NULL,
    "expiresOn" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'manual',
    "matchStatus" "MatchStatus" NOT NULL DEFAULT 'internal_only',
    "matchedRef" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColdroomLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColdroomCheck" (
    "id" TEXT NOT NULL,
    "storeCode" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "source" TEXT NOT NULL DEFAULT 'import',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColdroomCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyBill" (
    "id" TEXT NOT NULL,
    "utility" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnergyBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRunLine" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "partnerCode" TEXT,
    "gross" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "loanDeduct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imprestDeduct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "PayrollRunLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocAmendment" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "invoiceType" TEXT,
    "ref" TEXT,
    "summary" TEXT NOT NULL,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSuggestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payload" JSONB,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,

    CONSTRAINT "AiSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramChat" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");

-- CreateIndex
CREATE UNIQUE INDEX "SyncState_entity_key" ON "SyncState"("entity");

-- CreateIndex
CREATE UNIQUE INDEX "EnekasPartner_code_key" ON "EnekasPartner"("code");

-- CreateIndex
CREATE INDEX "EnekasPartner_groupCode_idx" ON "EnekasPartner"("groupCode");

-- CreateIndex
CREATE INDEX "EnekasPartner_title_idx" ON "EnekasPartner"("title");

-- CreateIndex
CREATE UNIQUE INDEX "EnekasAccount_code_key" ON "EnekasAccount"("code");

-- CreateIndex
CREATE INDEX "EnekasArticle_invoiceDate_idx" ON "EnekasArticle"("invoiceDate");

-- CreateIndex
CREATE INDEX "EnekasArticle_partnerCode_idx" ON "EnekasArticle"("partnerCode");

-- CreateIndex
CREATE INDEX "EnekasArticle_accountCode_idx" ON "EnekasArticle"("accountCode");

-- CreateIndex
CREATE INDEX "EnekasArticle_invoiceType_idx" ON "EnekasArticle"("invoiceType");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "ProductAlias_sourceText_idx" ON "ProductAlias"("sourceText");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAlias_sourceText_side_key" ON "ProductAlias"("sourceText", "side");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDay_partnerCode_day_key" ON "AttendanceDay"("partnerCode", "day");

-- CreateIndex
CREATE INDEX "PaymentObligation_dueDate_paid_idx" ON "PaymentObligation"("dueDate", "paid");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseCount_day_productId_key" ON "WarehouseCount"("day", "productId");

-- CreateIndex
CREATE INDEX "DailyWarehouseRow_day_idx" ON "DailyWarehouseRow"("day");

-- CreateIndex
CREATE UNIQUE INDEX "DailyWarehouseRow_day_productId_key" ON "DailyWarehouseRow"("day", "productId");

-- CreateIndex
CREATE INDEX "ColdroomLot_storeCode_matchStatus_idx" ON "ColdroomLot"("storeCode", "matchStatus");

-- CreateIndex
CREATE INDEX "ColdroomLot_expiresOn_idx" ON "ColdroomLot"("expiresOn");

-- CreateIndex
CREATE INDEX "ColdroomCheck_storeCode_checkedAt_idx" ON "ColdroomCheck"("storeCode", "checkedAt");

-- CreateIndex
CREATE INDEX "DocAmendment_day_idx" ON "DocAmendment"("day");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramChat_chatId_key" ON "TelegramChat"("chatId");

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAlias" ADD CONSTRAINT "ProductAlias_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyWarehouseRow" ADD CONSTRAINT "DailyWarehouseRow_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunLine" ADD CONSTRAINT "PayrollRunLine_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
