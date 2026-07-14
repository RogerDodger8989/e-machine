# e-Machines — Verkstads-CRM

e-Machines är ett kundregister och verktyg för försäljning och service av verkstadens maskiner — trädgårdsmaskiner (Stiga, Stihl m.fl.), cyklar och andra maskintyper, byggt specifikt för din verkstad. Tillverkare och kategorier är egna hanterade listor (inte hårdkodade), så det går att lägga till fler maskintyper efter hand. Appen körs helt lokalt i butikens nätverk — ingen molntjänst, ingen internetuppkoppling krävs för att fungera dagligen, och all data (kunder, maskiner, utskick) lagras bara på den här datorn.

## Komma igång

**Starta appen**: dubbelklicka på genvägen på skrivbordet eller i Start-menyn. Servern startar automatiskt i bakgrunden och appen öppnas i din webbläsare på `http://localhost:3500`.

**Nätverksåtkomst**: appen går att nå från andra enheter i samma nätverk (t.ex. en surfplatta eller en annan dator i butiken) genom att gå till `http://<den här datorns IP-adress>:3500` i en webbläsare där.

**Stäng ner**: servern fortsätter köra i bakgrunden tills datorn stängs av, eller via "Stoppa e-Machines"-genvägen om en sådan finns i Start-menyn.

---

## Huvudmenyn

Överst i appen: **Kunder · Maskiner · Sms · Statistik · Utskick · Inställningar**. Till höger visas alltid en sökruta, aktuellt 46elks-saldo, och en knapp för att växla mellan ljust och mörkt läge. Maskiner och Utskick har varsin rad med underflikar för att hålla ordning på relaterade sidor.

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

Två underflikar under samma huvudflik — tydligt åtskilda eftersom de är olika saker:

### Maskiner

Enskilda sålda/registrerade maskiner med serienummer, kopplade till sin ägare.

- **Registrera ny maskin**: välj kund, välj modell (eller skapa en ny modell — och vid behov en ny tillverkare — direkt i formuläret utan att lämna sidan), serienummer (dubbletter blockeras automatiskt, oavsett skiftläge), inköpsdatum, garantitid (förvalt från modellens standardgaranti, eller ange eget slutdatum).
- **Koppla loss maskin** från en kund (t.ex. såld vidare, skrotad, återlämnad) utan att radera maskinen eller dess servicehistorik — den syns sedan som "tidigare ägd" på både maskinen och den gamla ägaren.
- **Kampanjblad**: vilka kampanjblad en maskin kan få styrs av dess **modell** (se nedan), inte av maskinen själv — alla maskiner av samma modell delar samma kampanjblad. Har modellen minst ett kampanjblad kopplat dyker en **skrivarikon** upp, både på maskinsidan och direkt bredvid maskinen i kundens maskinlista (saknas ikonen, betyder det bara att modellen inte har något kampanjblad kopplat än). Klick tar dig till ett utskriftsklart A4-blad — er logga, adress, telefon och org.nr, kundens adress, samt en text om erbjudandet. Går att skriva ut/spara som PDF via webbläsarens utskriftsfunktion (Ctrl+P), eller **maila direkt till kunden** med en knapp på samma sida (kräver att kunden har e-post och lämnat marknadsföringssamtycke). Har modellen fler än ett kopplat kampanjblad väljer man vilket som ska visas/skrivas ut/mailas i en lista högst upp. Kampanjbladen (själva mallarna, med `{{variabler}}`) skapas och redigeras under Utskick → Kampanj → Kampanjblad — kopplingen till vilka modeller de gäller för sätts på modellens sida (se nedan).

### Modeller

Masterlista över maskintyper (tillverkare, modellnamn, kategori, standardgaranti, standardserviceintervall, kopplade kampanjblad) som enskilda maskiner kopplas till.

- **Skapa/redigera modell** — dubbletter (samma tillverkare + modellnamn, oavsett skiftläge) blockeras med tydligt felmeddelande.
- **Kampanjblad**: på modellens formulär (skapa och redigera) kryssar man i vilka av de befintliga kampanjbladmallarna som gäller för just den modellen — noll, ett eller flera. Det är den här kopplingen som avgör om maskiner av modellen får en skrivarikon (se ovan). Modellens detaljsida visar en lista över vilka som är kopplade just nu. Har en maskin flera kampanjblad kopplade visar ett **hovertips** på skrivarikonen/knappen vilka det är, utan att du behöver klicka dig in.
- **Tillverkare** (t.ex. "Stiga", "Stihl", eller ett cykelmärke) hanteras under Inställningar → Tillverkare — en egen hanterad lista, inte hårdkodad, så det går att lägga till fler maskintyper (t.ex. cyklar) än gräsklippare/motorsågar.
- **Kategorier** (t.ex. "Gräsklippare", "Cyklar") hanteras under Inställningar → Kategorier, och väljs eller skapas direkt inline när man registrerar en ny modell — går man den vägen kan man även fylla i kategorins standard-serviceintervall direkt i samma panel, det krävs inte ett separat besök på Kategorier-sidan. En kategori kan ha ett eget standard-serviceintervall (även ett separat intervall för *första* servicen, t.ex. "cyklar: 3 månader första gången, sedan 12 månader") som alla dess modeller ärver om de inte satt ett eget — värdet är delat, oavsett om kategorin skapades inline eller via Kategorier-sidan.

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

Maskinförsäljning: antal sålda maskiner per tillverkare (månad för månad eller år för år) och per modell, för valfritt datumintervall (med snabbval för de senaste 12/24 månaderna, innevarande år, föregående år).

Statistik för utskick (skickat/misslyckat/blockerat, per kanal, typ och maskinkategori) finns separat under **Utskick → Statistik**, se nedan.

---

## Utskick

Fyra underflikar för allt som rör att kontakta kunder:

### Logg

En samlad logg över **alla** utskick i hela appen — servicepåminnelser, kampanjer, kampanjblad och Sms-utskick — oavsett varifrån de skickades.

- **Filter**: status, kanal, typ, datumintervall.
- **Visa**-knappen på varje rad öppnar en dialog med fullständigt ämne och brödtext (inte bara den avkortade förhandsvisningen i tabellen) — samma dialog används både här och i kundvyns Utskicksregister.
- **Skicka om** enskilda misslyckade utskick, eller använd **"Skicka om alla olösta"** för att försöka igen med alla på en gång.
- **Ta bort** enskilda rader permanent.
- En röd bricka högst upp i appen ("N misslyckade utskick") visar hur många olösta misslyckanden som finns, oavsett vilken sida du står på — klick tar dig direkt till den filtrerade listan.

### Kampanj

- **Skicka kampanj**: skicka ett eget, manuellt utskick (t.ex. en säsongs- eller reakampanj) till de kunder som lämnat samtycke. Målgruppen går att smalna av på tillverkare, kategori, modell och inköpsår innan man väljer bland de filtrerade kunderna.
- **Kampanjblad**: skapa och redigera flera olika kampanjblad (t.ex. ett standarderbjudande och separata säsongskampanjer), med samma `{{variabler}}` som mallarna. Listan har en **Förhandsgranskning**-kolumn med en avkortad textrad (renderad med exempeldata, samma som i variabeltabellen ovanför) — en "Visa"-knapp öppnar en dialog med hela ämnet och brödtexten. Härifrån kan man även maila ett valt kampanjblad till flera kunder samtidigt — samma tillverkare/kategori/modell/inköpsår-filter som ovan, men på maskinnivå — kräver marknadsföringssamtycke.

På en enskild kunds sida finns ett motsvarande skicka-kort: välj bland alla aktiva mallar (kampanj eller kampanjblad, tydligt grupperade), kryssa i vilka av kundens maskiner kampanjbladet gäller (flera går att kryssa i samtidigt — ett kampanjblad mailas då per maskin), eller skapa en ny mall via länken dit.

### Service

Granska vilka kunder och maskiner som är aktuella för en servicepåminnelse just nu, filtrera vid behov på tillverkare/kategori/modell/inköpsår, välj vilka och vilken kanal (SMS/e-post) — inget skickas automatiskt, du väljer och trycker skicka varje gång.

### Statistik

Detaljerad statistik för utskick specifikt (skilt från maskinförsäljningsstatistiken under toppmenyns **Statistik**): totalt/skickat/misslyckat/blockerat över tid, uppdelat på kanal och typ, samt en tabell som grupperar utskick per maskinkategori (t.ex. hur många cykelägare fick en påminnelse den här månaden) — bara utskick kopplade till en maskin räknas i kategoriuppdelningen.

---

## Inställningar

- **Företagsuppgifter**: namn, adress, telefon, org.nr och logga — används på kampanjblad och som avsändarinformation i mallar.
- **Mallar för utskick**: skapa nya mallar eller redigera befintliga för servicepåminnelser, marknadsföring och Sms. En referenstabell visar varje tillgänglig variabel (t.ex. `{{customer_name}}`) med exempel och förklaring — klicka på en variabel för att kopiera den direkt till mallen du skriver.
- **E-post & SMS-anslutning**: konfigurera 46elks (SMS) och Mailercloud (e-post) — samma konto som redan används, ingen ny inloggning behövs. Själva utskicken sköts under Utskick i huvudmenyn.
- **Kategorier**: lägg till, döp om eller ta bort kategorier för maskinmodeller, samt sätt kategorins standard-serviceintervall.
- **Tillverkare**: lägg till, döp om eller ta bort tillverkare för maskinmodeller.
- **Backup & återställning**: ladda ner en färsk backup direkt när du vill, se automatiska dagliga backuper (sparas i 30 dagar, kan stängas av/på), ställ in en extra extern backupplats (t.ex. en nätverksenhet), och återställ databasen från en tidigare backupfil vid behov.
- **Importera data**: läs in en CSV- eller Excel-fil från ett annat system, koppla dess kolumner till rätt fält och förhandsgranska vad som kommer hända innan något sparas — går att köra återkommande, matchande poster uppdateras istället för att dubbleras. Tre separata importflöden, i rekommenderad ordning:
  1. **Kunder (Crona)** — kundregistret från kassasystemet Crona. Görs först, eftersom de andra två flödena matchar mot befintliga kunder.
  2. **Maskinägande (Crona)** — Cronas rapport över vilka maskiner varje kund äger. Ägarbyten flaggas tydligt i förhandsgranskningen innan de sparas.
  3. **Garantiprodukter (Stiga/Stihl)** — registrerade produkter med garanti, nedladdade från tillverkarens återförsäljarportal. Fungerar för valfri tillverkare i listan.

---

## Mörkt/ljust läge

Sol-/månikonen i headern växlar mellan ljust och mörkt läge. Valet sparas i webbläsaren och gäller för hela appen.

---

## För den som sköter installationen

- Appen är portabel — den bundlar sin egen Node.js-körmiljö, så inget behöver installeras separat på datorn för att den ska fungera.
- Databasen är en lokal SQLite-fil som sparas i programmets `data`-mapp, tillsammans med automatiska backuper.
- Servern binder till alla nätverksgränssnitt på port `3500`, så den går att nå från andra enheter i samma nätverk (se "Nätverksåtkomst" ovan).
- **Avinstallera** via Start-menyn ("Avinstallera e-Machines") eller Windows Inställningar → Appar. Avinstalleraren frågar om kundregistret och backuperna ska tas bort också — svarar man Nej sparas `data`-mappen kvar på disken (t.ex. inför en ominstallation).
