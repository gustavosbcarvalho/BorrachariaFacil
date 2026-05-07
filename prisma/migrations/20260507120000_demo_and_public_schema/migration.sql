-- ─── Marketplace/localização futura: schema apenas ─────────────────────────

ALTER TABLE "borracharias"
    ADD COLUMN "public_listing_enabled" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "public_name" TEXT,
    ADD COLUMN "public_description" TEXT,
    ADD COLUMN "public_phone" TEXT,
    ADD COLUMN "whatsapp_number" TEXT,
    ADD COLUMN "latitude" DECIMAL(10,7),
    ADD COLUMN "longitude" DECIMAL(10,7),
    ADD COLUMN "opening_hours" JSONB,
    ADD COLUMN "logo_url" TEXT,
    ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "demo_seed_version" INTEGER,
    ADD COLUMN "demo_last_seeded_at" TIMESTAMP(3);

CREATE INDEX "borracharias_is_demo_idx" ON "borracharias"("is_demo");
CREATE INDEX "borracharias_public_listing_enabled_idx" ON "borracharias"("public_listing_enabled");

ALTER TABLE "service_types"
    ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "starting_price" DECIMAL(10,2);

-- ─── Dados existentes: piloto real Mercosul ─────────────────────────────────

UPDATE "borracharias" AS b
SET
    "name" = 'Borracharia Mercosul - 61.539.497/0001-05',
    "cnpj" = '61.539.497/0001-05',
    "public_name" = 'Borracharia Mercosul',
    "public_listing_enabled" = false,
    "is_demo" = false
WHERE (b."cnpj" = '00.000.000/0001-00' OR b."name" = 'Borracharia Piloto')
  AND NOT EXISTS (
      SELECT 1
      FROM "borracharias" existing
      WHERE existing."cnpj" = '61.539.497/0001-05'
        AND existing."id" <> b."id"
  );

UPDATE "borracharias"
SET
    "name" = 'Borracharia Mercosul - 61.539.497/0001-05',
    "public_name" = 'Borracharia Mercosul',
    "public_listing_enabled" = false,
    "is_demo" = false
WHERE "cnpj" = '61.539.497/0001-05';

UPDATE "users" AS u
SET "email" = 'alexs2007@hotmail.com'
WHERE u."email" = 'admin@borracharia.com'
  AND NOT EXISTS (
      SELECT 1
      FROM "users" existing
      WHERE existing."email" = 'alexs2007@hotmail.com'
        AND existing."id" <> u."id"
  );

UPDATE "users"
SET "must_change_password" = false
WHERE "email" IN (
    'gustavo.sbcarvalho@gmail.com',
    'alexs2007@hotmail.com'
);
