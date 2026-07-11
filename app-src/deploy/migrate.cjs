#!/usr/bin/env node
/**
 * Fristående migrator för den paketerade Windows-installationen — körs av
 * launcher.vbs innan servern startar. Vi använder inte Prisma-CLI:t här
 * (det skulle kräva att hela prisma-paketet + query engines bundlas i
 * installern); istället spelar vi upp samma migration.sql-filer som `prisma
 * migrate dev` skapade under utveckling, med en egen enkel bokföringstabell
 * (`_app_migrations`) som håller reda på vilka som redan körts. Idempotent:
 * säker att köra vid varje programstart.
 */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/^file:/, "")
  : path.join(__dirname, "..", "..", "data", "e-machines.db");
const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");

function main() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS _app_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = new Set(db.prepare("SELECT name FROM _app_migrations").all().map((r) => r.name));
  const migrationFolders = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let ranCount = 0;
  for (const folder of migrationFolders) {
    if (applied.has(folder)) continue;
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    console.log(`[migrate] Kör ${folder}...`);
    db.exec(sql);
    db.prepare("INSERT INTO _app_migrations (name) VALUES (?)").run(folder);
    ranCount++;
  }

  db.close();
  console.log(ranCount > 0 ? `[migrate] ${ranCount} migration(er) tillämpade.` : "[migrate] Databasen är redan uppdaterad.");
}

main();
