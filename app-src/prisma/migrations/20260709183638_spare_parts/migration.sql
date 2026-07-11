-- CreateTable
CREATE TABLE "part_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_quick_filter" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "spare_parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manufacturer" TEXT NOT NULL,
    "article_number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT,
    "price_ex_vat_ore" INTEGER,
    "price_inc_vat_ore" INTEGER,
    "unit" TEXT,
    "is_discontinued" BOOLEAN NOT NULL DEFAULT false,
    "supplier_updated_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "spare_parts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "part_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "part_compatibility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "machine_model_id" TEXT NOT NULL,
    "spare_part_id" TEXT NOT NULL,
    CONSTRAINT "part_compatibility_machine_model_id_fkey" FOREIGN KEY ("machine_model_id") REFERENCES "machine_models" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "part_compatibility_spare_part_id_fkey" FOREIGN KEY ("spare_part_id") REFERENCES "spare_parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "part_replacements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "old_part_id" TEXT NOT NULL,
    "new_part_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "part_replacements_old_part_id_fkey" FOREIGN KEY ("old_part_id") REFERENCES "spare_parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "part_replacements_new_part_id_fkey" FOREIGN KEY ("new_part_id") REFERENCES "spare_parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "import_mapping_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "mapping" TEXT NOT NULL,
    "delimiter" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "row_count" INTEGER NOT NULL,
    "mapping_profile_id" TEXT,
    "imported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "part_categories_name_key" ON "part_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spare_parts_manufacturer_article_number_key" ON "spare_parts"("manufacturer", "article_number");

-- CreateIndex
CREATE UNIQUE INDEX "part_compatibility_machine_model_id_spare_part_id_key" ON "part_compatibility"("machine_model_id", "spare_part_id");

-- CreateIndex
CREATE UNIQUE INDEX "part_replacements_old_part_id_key" ON "part_replacements"("old_part_id");

-- CreateIndex
CREATE UNIQUE INDEX "import_mapping_profiles_supplier_file_type_key" ON "import_mapping_profiles"("supplier", "file_type");

-- Cykelskydd för ersättningskedjor: blockerar t.ex. att C pekar tillbaka på A
-- i en kedja A→B→C.
CREATE TRIGGER prevent_replacement_cycle
BEFORE INSERT ON "part_replacements"
FOR EACH ROW
WHEN EXISTS (
  WITH RECURSIVE chain(part_id) AS (
    SELECT NEW.new_part_id
    UNION ALL
    SELECT pr.new_part_id FROM part_replacements pr JOIN chain c ON pr.old_part_id = c.part_id
  )
  SELECT 1 FROM chain WHERE part_id = NEW.old_part_id
)
BEGIN
  SELECT RAISE(ABORT, 'Replacement chain would create a cycle');
END;

-- FTS5-tabeller för reservdelsbeskrivning (fuzzy-sökning), samma mönster som
-- customers/machines/machine_models.
CREATE VIRTUAL TABLE spare_parts_fts USING fts5(
  entity_id UNINDEXED,
  description,
  article_number,
  tokenize = 'trigram'
);

CREATE TRIGGER spare_parts_fts_ai AFTER INSERT ON spare_parts BEGIN
  INSERT INTO spare_parts_fts(entity_id, description, article_number)
  VALUES (new.id, new.description, new.article_number);
END;

CREATE TRIGGER spare_parts_fts_ad AFTER DELETE ON spare_parts BEGIN
  DELETE FROM spare_parts_fts WHERE entity_id = old.id;
END;

CREATE TRIGGER spare_parts_fts_au AFTER UPDATE ON spare_parts BEGIN
  DELETE FROM spare_parts_fts WHERE entity_id = old.id;
  INSERT INTO spare_parts_fts(entity_id, description, article_number)
  VALUES (new.id, new.description, new.article_number);
END;
