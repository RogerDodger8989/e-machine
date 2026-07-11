-- customers_fts måste byggas om för att indexera company — SQLite FTS5 stödjer
-- inte ALTER TABLE på virtuella tabeller, så vi droppar och återskapar den
-- (samt de tre synk-triggrarna) och repopulerar från customers.

DROP TRIGGER customers_fts_ai;
DROP TRIGGER customers_fts_ad;
DROP TRIGGER customers_fts_au;
DROP TABLE customers_fts;

CREATE VIRTUAL TABLE customers_fts USING fts5(
  entity_id UNINDEXED,
  name,
  company,
  phone_normalized,
  tokenize = 'trigram'
);

INSERT INTO customers_fts(entity_id, name, company, phone_normalized)
SELECT id, name, coalesce(company, ''), coalesce(phone_normalized, '') FROM customers;

CREATE TRIGGER customers_fts_ai AFTER INSERT ON customers BEGIN
  INSERT INTO customers_fts(entity_id, name, company, phone_normalized)
  VALUES (new.id, new.name, coalesce(new.company, ''), coalesce(new.phone_normalized, ''));
END;

CREATE TRIGGER customers_fts_ad AFTER DELETE ON customers BEGIN
  DELETE FROM customers_fts WHERE entity_id = old.id;
END;

CREATE TRIGGER customers_fts_au AFTER UPDATE ON customers BEGIN
  DELETE FROM customers_fts WHERE entity_id = old.id;
  INSERT INTO customers_fts(entity_id, name, company, phone_normalized)
  VALUES (new.id, new.name, coalesce(new.company, ''), coalesce(new.phone_normalized, ''));
END;
