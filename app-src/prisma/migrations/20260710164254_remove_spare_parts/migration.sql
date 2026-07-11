-- Reservdelsfunktionen tas bort helt: import, kategorier, ersättningskedjor,
-- kompatibilitet och sökindexet för reservdelar.

DROP TRIGGER IF EXISTS spare_parts_fts_ai;
DROP TRIGGER IF EXISTS spare_parts_fts_ad;
DROP TRIGGER IF EXISTS spare_parts_fts_au;
DROP TABLE IF EXISTS spare_parts_fts;

DROP TRIGGER IF EXISTS prevent_replacement_cycle;

PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS part_replacements;
DROP TABLE IF EXISTS part_compatibility;
DROP TABLE IF EXISTS import_batches;
DROP TABLE IF EXISTS import_mapping_profiles;
DROP TABLE IF EXISTS spare_parts;
DROP TABLE IF EXISTS part_categories;
PRAGMA foreign_keys=on;
