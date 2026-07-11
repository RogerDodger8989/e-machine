// Bygger installer/dist/payload/ — allt Inno Setup ska packa in i Setup.exe.
// Körs med systemets Node (inte den portabla runtimen som bundlas med appen).
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appSrcDir = path.join(rootDir, "app-src");
const payloadDir = path.join(rootDir, "dist", "payload");

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

console.log("1/5 Bygger Next.js standalone-utdata...");
execSync("npm run build", { cwd: appSrcDir, stdio: "inherit" });

console.log("2/5 Rensar tidigare payload...");
rmrf(payloadDir);
fs.mkdirSync(payloadDir, { recursive: true });

console.log("3/5 Kopierar standalone-servern...");
const standaloneDir = path.join(appSrcDir, ".next", "standalone");
const appDest = path.join(payloadDir, "app");
copyDir(standaloneDir, appDest);
// Standalone-utdata innehåller inte statiska tillgångar / public — måste
// kopieras in manuellt enligt Next.js dokumentation.
copyDir(path.join(appSrcDir, ".next", "static"), path.join(appDest, ".next", "static"));
copyDir(path.join(appSrcDir, "public"), path.join(appDest, "public"));
// Standalone-tracing plockar inte upp migrationsfilerna (de importeras inte
// av kod) — kopieras in manuellt för deploy/migrate.cjs att läsa.
copyDir(path.join(appSrcDir, "prisma", "migrations"), path.join(appDest, "prisma", "migrations"));
copyDir(path.join(appSrcDir, "deploy"), path.join(appDest, "deploy"));
// Ta inte med utvecklarens lokala .env (innehåller dev-DATABASE_URL) —
// körtidsvariabler sätts explicit av launcher.vbs från config.env istället
// (se nedan), inte via Next.js egen .env-inläsning.
rmrf(path.join(appDest, ".env"));

console.log("4/5 Kopierar portabel Node-runtime och launcher-skript...");
copyDir(path.join(rootDir, "vendor", "node-runtime"), path.join(payloadDir, "node-runtime"));
fs.copyFileSync(path.join(rootDir, "installer", "launcher.vbs"), path.join(payloadDir, "launcher.vbs"));
fs.copyFileSync(path.join(rootDir, "installer", "stop.vbs"), path.join(payloadDir, "stop.vbs"));

console.log("5/5 Skriver config.env-mall...");
fs.writeFileSync(
  path.join(payloadDir, "config.env"),
  `# Fylls i vid installation hos kund. Läses av launcher.vbs vid varje start
# och sätts som miljövariabler åt servern (rad-för-rad KEY=VALUE, # för kommentar).
COMPANY_NAME=Verkstaden
ELKS_API_USERNAME=
ELKS_API_PASSWORD=
ELKS_FROM=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
`
);

console.log(`\nKlart. Payload i: ${payloadDir}`);
console.log('Kör "ISCC installer/setup.iss" för att bygga Setup.exe.');
