-- Remove legacy global unique indexes left by the initial single-tenant schema.
-- The active uniqueness rules are the tenant-scoped composite indexes:
-- service_types(name, borracharia_id) and expense_categories(name, borracharia_id).

DROP INDEX IF EXISTS "service_types_name_key";
DROP INDEX IF EXISTS "expense_categories_name_key";
