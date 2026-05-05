-- ─── Fase 1: Auditoria, Soft Delete, Companies, Placa, Timezone, Índices ──────

-- companies
CREATE TABLE "companies" (
    "id"           TEXT NOT NULL,
    "borracharia_id" TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "cnpj"         TEXT,
    "contact_name" TEXT,
    "phone"        TEXT,
    "active"       BOOLEAN NOT NULL DEFAULT true,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "companies_borracharia_id_fkey"
        FOREIGN KEY ("borracharia_id") REFERENCES "borracharias"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "companies_borracharia_id_idx" ON "companies"("borracharia_id");

-- ─── Borracharias ─────────────────────────────────────────────────────────────

ALTER TABLE "borracharias"
    ADD COLUMN "timezone"    TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    ADD COLUMN "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ─── Users ────────────────────────────────────────────────────────────────────

ALTER TABLE "users"
    ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "updated_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Usuários do seed não precisam trocar senha (já conhecidos)
UPDATE "users"
SET "must_change_password" = false
WHERE "email" IN (
    'gustavo.sbcarvalho@gmail.com',
    'admin@borracharia.com',
    'operador@borracharia.com'
);

-- ─── Services ─────────────────────────────────────────────────────────────────

ALTER TABLE "services"
    ADD COLUMN "vehicle_plate"  TEXT,
    ADD COLUMN "updated_by_id"  TEXT,
    ADD COLUMN "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "deleted_at"     TIMESTAMP(3);

ALTER TABLE "services"
    ADD CONSTRAINT "services_updated_by_id_fkey"
    FOREIGN KEY ("updated_by_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "services_borracharia_id_idx"  ON "services"("borracharia_id");
CREATE INDEX "services_occurred_at_idx"     ON "services"("occurred_at");
CREATE INDEX "services_payment_method_idx"  ON "services"("payment_method");
CREATE INDEX "services_payment_status_idx"  ON "services"("payment_status");
CREATE INDEX "services_convenio_id_idx"     ON "services"("convenio_id");
CREATE INDEX "services_vehicle_plate_idx"   ON "services"("vehicle_plate");
CREATE INDEX "services_deleted_at_idx"      ON "services"("deleted_at");

-- ─── Expenses ─────────────────────────────────────────────────────────────────

ALTER TABLE "expenses"
    ADD COLUMN "updated_by_id" TEXT,
    ADD COLUMN "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "deleted_at"    TIMESTAMP(3);

ALTER TABLE "expenses"
    ADD CONSTRAINT "expenses_updated_by_id_fkey"
    FOREIGN KEY ("updated_by_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "expenses_borracharia_id_idx" ON "expenses"("borracharia_id");
CREATE INDEX "expenses_occurred_at_idx"    ON "expenses"("occurred_at");
CREATE INDEX "expenses_payment_method_idx" ON "expenses"("payment_method");
CREATE INDEX "expenses_deleted_at_idx"     ON "expenses"("deleted_at");

-- ─── Convenios ────────────────────────────────────────────────────────────────

ALTER TABLE "convenios"
    ADD COLUMN "company_id"  TEXT,
    ADD COLUMN "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "deleted_at"  TIMESTAMP(3);

ALTER TABLE "convenios"
    ADD CONSTRAINT "convenios_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "convenios_borracharia_id_idx" ON "convenios"("borracharia_id");
CREATE INDEX "convenios_deleted_at_idx"     ON "convenios"("deleted_at");

-- ─── ConvenioPayments ─────────────────────────────────────────────────────────

CREATE INDEX "convenio_payments_convenio_id_idx" ON "convenio_payments"("convenio_id");
