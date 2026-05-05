-- Remove constraints únicas globais em name (deixadas pela migration anterior).
-- Mantém apenas as constraints compostas (name, borracharia_id).
-- Sem isso, borracharias diferentes não podem ter tipos de serviço com o mesmo nome.

ALTER TABLE "service_types"
    DROP CONSTRAINT IF EXISTS "service_types_name_key";

ALTER TABLE "expense_categories"
    DROP CONSTRAINT IF EXISTS "expense_categories_name_key";

-- Remove enum ServiceStatus que ficou órfão no banco (não é mais usado por nenhuma coluna)
DROP TYPE IF EXISTS "ServiceStatus";
