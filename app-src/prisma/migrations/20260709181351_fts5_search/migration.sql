-- Fuzzy-sökning via FTS5-tabeller med trigram-tokenizer.
-- Entiteterna har textbaserade (cuid) primärnycklar, inte heltal, så vi använder
-- fristående FTS5-tabeller (inte "external content") med en oindexerad entity_id-kolumn
-- och triggers som håller dem synkade med basdata.

-- --- customers ---------------------------------------------------------------

CREATE VIRTUAL TABLE customers_fts USING fts5(
  entity_id UNINDEXED,
  name,
  phone_normalized,
  tokenize = 'trigram'
);

INSERT INTO customers_fts(entity_id, name, phone_normalized)
SELECT id, name, coalesce(phone_normalized, '') FROM customers;

CREATE TRIGGER customers_fts_ai AFTER INSERT ON customers BEGIN
  INSERT INTO customers_fts(entity_id, name, phone_normalized)
  VALUES (new.id, new.name, coalesce(new.phone_normalized, ''));
END;

CREATE TRIGGER customers_fts_ad AFTER DELETE ON customers BEGIN
  DELETE FROM customers_fts WHERE entity_id = old.id;
END;

CREATE TRIGGER customers_fts_au AFTER UPDATE ON customers BEGIN
  DELETE FROM customers_fts WHERE entity_id = old.id;
  INSERT INTO customers_fts(entity_id, name, phone_normalized)
  VALUES (new.id, new.name, coalesce(new.phone_normalized, ''));
END;

-- --- machines (serienummer) ---------------------------------------------------

CREATE VIRTUAL TABLE machines_fts USING fts5(
  entity_id UNINDEXED,
  serial_number,
  tokenize = 'trigram'
);

INSERT INTO machines_fts(entity_id, serial_number)
SELECT id, serial_number FROM machines;

CREATE TRIGGER machines_fts_ai AFTER INSERT ON machines BEGIN
  INSERT INTO machines_fts(entity_id, serial_number)
  VALUES (new.id, new.serial_number);
END;

CREATE TRIGGER machines_fts_ad AFTER DELETE ON machines BEGIN
  DELETE FROM machines_fts WHERE entity_id = old.id;
END;

CREATE TRIGGER machines_fts_au AFTER UPDATE ON machines BEGIN
  DELETE FROM machines_fts WHERE entity_id = old.id;
  INSERT INTO machines_fts(entity_id, serial_number)
  VALUES (new.id, new.serial_number);
END;

-- --- machine_models (modellnamn) -----------------------------------------------

CREATE VIRTUAL TABLE machine_models_fts USING fts5(
  entity_id UNINDEXED,
  model_name,
  tokenize = 'trigram'
);

INSERT INTO machine_models_fts(entity_id, model_name)
SELECT id, model_name FROM machine_models;

CREATE TRIGGER machine_models_fts_ai AFTER INSERT ON machine_models BEGIN
  INSERT INTO machine_models_fts(entity_id, model_name)
  VALUES (new.id, new.model_name);
END;

CREATE TRIGGER machine_models_fts_ad AFTER DELETE ON machine_models BEGIN
  DELETE FROM machine_models_fts WHERE entity_id = old.id;
END;

CREATE TRIGGER machine_models_fts_au AFTER UPDATE ON machine_models BEGIN
  DELETE FROM machine_models_fts WHERE entity_id = old.id;
  INSERT INTO machine_models_fts(entity_id, model_name)
  VALUES (new.id, new.model_name);
END;
