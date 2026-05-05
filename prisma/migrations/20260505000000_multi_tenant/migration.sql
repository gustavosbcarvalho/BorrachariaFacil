-- ─── Novos Enums ──────────────────────────────────────────────────────────────

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'COURTESY');
CREATE TYPE "PaymentFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');
CREATE TYPE "PlanStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE "PlanName" AS ENUM ('FREE', 'BASIC', 'PRO');

-- Adicionar novos valores aos enums existentes
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SYSTEM_ADMIN';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'CONVENIO';

-- ─── Tabela borracharias ───────────────────────────────────────────────────────

CREATE TABLE "borracharias" (
    "id"                  TEXT NOT NULL,
    "name"                TEXT NOT NULL,
    "cnpj"                TEXT,
    "cpf"                 TEXT,
    "address"             TEXT NOT NULL,
    "city"                TEXT NOT NULL,
    "state"               TEXT NOT NULL,
    "zip_code"            TEXT NOT NULL,
    "active"              BOOLEAN NOT NULL DEFAULT true,
    "plan_status"         "PlanStatus" NOT NULL DEFAULT 'TRIAL',
    "plan_name"           "PlanName" NOT NULL DEFAULT 'FREE',
    "trial_ends_at"       TIMESTAMP(3),
    "subscription_notes"  TEXT,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "borracharias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "borracharias_cnpj_key" ON "borracharias"("cnpj");

-- ─── Tabela convenios ──────────────────────────────────────────────────────────

CREATE TABLE "convenios" (
    "id"                TEXT NOT NULL,
    "borracharia_id"    TEXT NOT NULL,
    "company_name"      TEXT NOT NULL,
    "payment_frequency" "PaymentFrequency" NOT NULL,
    "next_payment_date" TIMESTAMP(3) NOT NULL,
    "active"            BOOLEAN NOT NULL DEFAULT true,
    "notes"             TEXT,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("id")
);

-- ─── Tabela convenio_payments ──────────────────────────────────────────────────

CREATE TABLE "convenio_payments" (
    "id"          TEXT NOT NULL,
    "convenio_id" TEXT NOT NULL,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "paid_at"     TIMESTAMP(3) NOT NULL,
    "notes"       TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convenio_payments_pkey" PRIMARY KEY ("id")
);

-- ─── Alterações na tabela users ───────────────────────────────────────────────

ALTER TABLE "users" ADD COLUMN "borracharia_id" TEXT;

-- ─── Alterações na tabela service_types ──────────────────────────────────────

-- Remover constraint unique antiga (apenas name)
ALTER TABLE "service_types" DROP CONSTRAINT IF EXISTS "service_types_name_key";

ALTER TABLE "service_types" ADD COLUMN "borracharia_id" TEXT;

-- Nova constraint composta
CREATE UNIQUE INDEX "service_types_name_borracharia_id_key"
    ON "service_types"("name", "borracharia_id");

-- ─── Alterações na tabela expense_categories ─────────────────────────────────

ALTER TABLE "expense_categories" DROP CONSTRAINT IF EXISTS "expense_categories_name_key";

ALTER TABLE "expense_categories" ADD COLUMN "borracharia_id" TEXT;

CREATE UNIQUE INDEX "expense_categories_name_borracharia_id_key"
    ON "expense_categories"("name", "borracharia_id");

-- ─── Alterações na tabela services ───────────────────────────────────────────

ALTER TABLE "services" ADD COLUMN "borracharia_id"      TEXT;
ALTER TABLE "services" ADD COLUMN "amount_paid"         DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN "amount_due"          DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN "payment_status"      "PaymentStatus" NOT NULL DEFAULT 'PAID';
ALTER TABLE "services" ADD COLUMN "convenio_id"         TEXT;
ALTER TABLE "services" ADD COLUMN "convenio_payment_id" TEXT;

-- Migrar valores do campo status → payment_status (via cast text)
UPDATE "services"
SET "payment_status" =
    CASE "status"::text
        WHEN 'PAID'     THEN 'PAID'::"PaymentStatus"
        WHEN 'PENDING'  THEN 'PENDING'::"PaymentStatus"
        WHEN 'COURTESY' THEN 'COURTESY'::"PaymentStatus"
        ELSE 'PAID'::"PaymentStatus"
    END;

-- Remover campo status antigo (enum ServiceStatus)
ALTER TABLE "services" DROP COLUMN IF EXISTS "status";

-- ─── Alterações na tabela expenses ───────────────────────────────────────────

ALTER TABLE "expenses" ADD COLUMN "borracharia_id" TEXT;

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────

ALTER TABLE "users"
    ADD CONSTRAINT "users_borracharia_id_fkey"
    FOREIGN KEY ("borracharia_id") REFERENCES "borracharias"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "service_types"
    ADD CONSTRAINT "service_types_borracharia_id_fkey"
    FOREIGN KEY ("borracharia_id") REFERENCES "borracharias"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "expense_categories"
    ADD CONSTRAINT "expense_categories_borracharia_id_fkey"
    FOREIGN KEY ("borracharia_id") REFERENCES "borracharias"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "services"
    ADD CONSTRAINT "services_borracharia_id_fkey"
    FOREIGN KEY ("borracharia_id") REFERENCES "borracharias"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "services"
    ADD CONSTRAINT "services_convenio_id_fkey"
    FOREIGN KEY ("convenio_id") REFERENCES "convenios"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "services"
    ADD CONSTRAINT "services_convenio_payment_id_fkey"
    FOREIGN KEY ("convenio_payment_id") REFERENCES "convenio_payments"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "expenses"
    ADD CONSTRAINT "expenses_borracharia_id_fkey"
    FOREIGN KEY ("borracharia_id") REFERENCES "borracharias"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "convenios"
    ADD CONSTRAINT "convenios_borracharia_id_fkey"
    FOREIGN KEY ("borracharia_id") REFERENCES "borracharias"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "convenio_payments"
    ADD CONSTRAINT "convenio_payments_convenio_id_fkey"
    FOREIGN KEY ("convenio_id") REFERENCES "convenios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
