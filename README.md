# e-Machines — Verkstads-CRM

e-Machines är ett kundregister och verktyg för försäljning och service av Stiga/Stihl-maskiner, byggt specifikt för din verkstad. Appen körs helt lokalt i butikens nätverk — ingen molntjänst, ingen internetuppkoppling krävs för att fungera dagligen, och all data (kunder, maskiner, utskick) lagras bara på den här datorn.

## Komma igång

**Starta appen**: dubbelklicka på genvägen på skrivbordet eller i Start-menyn. Servern startar automatiskt i bakgrunden och appen öppnas i din webbläsare på `http://localhost:3500`.

**Nätverksåtkomst**: appen går att nå från andra enheter i samma nätverk (t.ex. en surfplatta eller en annan dator i butiken) genom att gå till `http://<den här datorns IP-adress>:3500` i en webbläsare där.

**Stäng ner**: servern fortsätter köra i bakgrunden tills datorn stängs av, eller via "Stoppa e-Machines"-genvägen om en sådan finns i Start-menyn.

---

## Huvudmenyn

Överst i appen: **Kunder · Maskiner · Modeller · Sms · Statistik · Utskick · Inställningar**. Till höger visas alltid en sökruta, aktuellt 46elks-saldo, och en knapp för att växla mellan ljust och mörkt läge.

### Sökrutan

Sök på kundnamn, telefonnummer, modell eller serienummer — resultat visas direkt medan du skriver, oavsett vilken flik du står på.

---

## Kunder

Register över alla kunder: kontaktperson, ev. företag, telefon, e-post, adress, samt om kunden lämnat samtycke till marknadsföringsutskick.

- **Skapa/redigera kund** via formuläret. Samtycke till marknadsföring är förikryssat som standard för nya kunder — avmarkera vid behov om en specifik kund inte vill ha kampanjutskick.
- **Kundsidan** visar kontaktuppgifter, alla registrerade maskiner (med snabblänk till att lägga till en ny), ett fritt **anteckningsfält** som sparas direkt utan att behöva gå in i redigeringsläge, och ett **utskicksregister** — allt som skickats till just den kunden, med status och möjlighet att skicka om misslyckade utskick.
- **E-postadresser är klickbara**: klick öppnar ett nytt utkast i Outlook.com i en ny flik; en liten kopiera-ikon bredvid kopierar adressen och bekräftar med en notis.
- **"Radera kund"** raderar inte kunden helt (GDPR-anonymisering) — namn, telefon, e-post och adress rensas, men maskinhistorik och utskicksregister finns kvar (nu kopplat till "Raderad kund") som ett spårbart, anonymt underlag.

---

## Maskiner

Register över alla sålda/registrerade maskiner, kopplade till sin ägare.

- **Registrera ny maskin**: välj kund, välj modell (eller skapa en ny modell direkt i formuläret utan att lämna sidan), serienummer (dubbletter blockeras automatiskt, oavsett skiftläge), inköpsdatum, garantitid (förvalt från modellens standardgaranti, eller ange eget slutdatum).
- **"Erbjuder hämt-/lämnservice"**: kryssruta som avgör om maskinen är berättigad till kampanjbladet nedan.
- **Koppla loss maskin** från en kund (t.ex. såld vidare, skrotad, återlämnad) utan att radera maskinen eller dess servicehistorik — den syns sedan som "tidigare ägd" på både maskinen och den gamla ägaren.
- **Kampanjblad**: för maskiner med hämt-/lämnservice ikryssad dyker en länk upp (både på maskinsidan och direkt i kundens maskinlista) till ett utskriftsklart A4-blad — er logga, adress, telefon och org.nr, kundens adress, samt en text om erbjudandet. Går att skriva ut/spara som PDF via webbläsarens utskriftsfunktion (Ctrl+P), eller **maila direkt till kunden** med en knapp på samma sida (kräver att kunden har e-post och lämnat marknadsföringssamtycke). Finns fler kampanjblad väljer man vilket som ska visas/skrivas ut/mailas i en lista högst upp. Kampanjbladen skapas och redigeras under Inställningar → Kampanjblad, där man även kan maila ett valt kampanjblad till flera kunder på en gång.

---

## Modeller

Masterlista över maskinmodeller (tillverkare, modellnamn, kategori, standardgaranti, standardserviceintervall) som maskiner kopplas till.

- **Skapa/redigera modell** — dubbletter (samma tillverkare + modellnamn, oavsett skiftläge) blockeras med tydligt felmeddelande.
- **Kategorier** (t.ex. "Gräsklippare", "Motorsåg") hanteras under Inställningar → Kategorier, och väljs eller skapas direkt inline när man registrerar en ny modell.

---

## Sms

Fristående SMS-utskick till valfritt telefonnummer — kräver ingen registrerad kund, precis som det fristående SendSms-verktyget det ersätter.

- **Skicka SMS**: telefonnummer, vara/artikel, summa att betala (kr), välj en färdig mall eller skriv ett eget meddelande fritt. Meddelandefältet visar löpande hur många tecken och SMS-delar meddelandet blir.
- **Tre färdiga mallar** finns från start: "Klar för hämtning", "Försenad" och "Påminnelse" — redigeras eller kompletteras under Inställningar → Mallar.
- **Historik**: sökbar lista (sök på telefonnummer eller vara) över alla skickade sms, med en avkortad förhandsvisning av meddelandet (hela texten syns när musen hålls över).
- **Misslyckade utskick**: två knappar dyker upp — **skicka om** (samma text till samma nummer igen) eller **ta bort** raden helt (efter bekräftelse).
- **Lyckade utskick**: en klock-ikon för att skicka en påminnelse manuellt — visar datum för senaste påminnelsen och hur många som skickats när musen hålls över.

---

## Statistik

- **Försäljning**: antal sålda maskiner per tillverkare (månad för månad eller år för år) och per modell, för valfritt datumintervall (med snabbval för de senaste 12/24 månaderna, innevarande år, föregående år).
- **Utskick**: totalt antal, uppdelat på skickat/misslyckat/blockerat, med ett månadsdiagram och möjlighet att se det uppdelat per kanal (SMS/e-post) och typ (servicepåminnelse/marknadsföring/sms).

---

## Utskick

En samlad logg över **alla** utskick i hela appen — servicepåminnelser, kampanjer och Sms-utskick — oavsett varifrån de skickades.

- **Filter**: status, kanal, typ, datumintervall.
- **Skicka om** enskilda misslyckade utskick, eller använd **"Skicka om alla olösta"** för att försöka igen med alla på en gång.
- **Ta bort** enskilda rader permanent.
- En röd bricka högst upp i appen ("N misslyckade utskick") visar hur många olösta misslyckanden som finns, oavsett vilken sida du står på — klick tar dig direkt till den filtrerade listan.

---

## Inställningar

- **Företagsuppgifter**: namn, adress, telefon, org.nr och logga — används på kampanjblad och som avsändarinformation i mallar.
- **Kampanjblad**: skapa och redigera flera olika kampanjblad (t.ex. ett standarderbjudande och separata säsongskampanjer), med samma `{{variabler}}` som mallarna nedan. Härifrån kan man även maila ett valt kampanjblad till flera kunder samtidigt — kräver marknadsföringssamtycke, precis som Kampanjer nedan.
- **Mallar för utskick**: skapa nya mallar eller redigera befintliga för servicepåminnelser, marknadsföring och Sms. En referenstabell visar varje tillgänglig variabel (t.ex. `{{customer_name}}`) med exempel och förklaring — klicka på en variabel för att kopiera den direkt till mallen du skriver.
- **Utskick**: konfigurera 46elks (SMS) och Mailercloud (e-post) — samma konto som redan används, ingen ny inloggning behövs.
- **Servicepåminnelser**: granska vilka kunder som är aktuella för en påminnelse just nu, välj vilka och vilken kanal (SMS/e-post) — inget skickas automatiskt, du väljer och trycker skicka varje gång.
- **Kampanjer**: skicka ett eget, manuellt utskick (t.ex. en säsongs- eller reakampanj) till de kunder som lämnat samtycke.
- **Kategorier**: lägg till, döp om eller ta bort kategorier för maskinmodeller.
- **Backup & återställning**: ladda ner en färsk backup direkt när du vill, se automatiska dagliga backuper (sparas i 30 dagar, kan stängas av/på), ställ in en extra extern backupplats (t.ex. en nätverksenhet), och återställ databasen från en tidigare backupfil vid behov.

---

## Mörkt/ljust läge

Sol-/månikonen i headern växlar mellan ljust och mörkt läge. Valet sparas i webbläsaren och gäller för hela appen.

---

## För den som sköter installationen

- Appen är portabel — den bundlar sin egen Node.js-körmiljö, så inget behöver installeras separat på datorn för att den ska fungera.
- Databasen är en lokal SQLite-fil som sparas i programmets `data`-mapp, tillsammans med automatiska backuper.
- Servern binder till alla nätverksgränssnitt på port `3500`, så den går att nå från andra enheter i samma nätverk (se "Nätverksåtkomst" ovan).
- **Avinstallera** via Start-menyn ("Avinstallera e-Machines") eller Windows Inställningar → Appar. Avinstalleraren frågar om kundregistret och backuperna ska tas bort också — svarar man Nej sparas `data`-mappen kvar på disken (t.ex. inför en ominstallation).
