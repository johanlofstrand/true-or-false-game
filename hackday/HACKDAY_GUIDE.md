# Hackday Guide: Bygg ett multiplayer-spel med AI

Bygg ett realtids-quizspel med hjälp av en AI-kodassistent. Varje steg beskriver **vad du ska uppnå** och **hur du vet att du är klar**. Du behöver inte veta hur det ska lösas tekniskt — det är det AI:n är till för.

---

## Vad du bygger

Ett realtids-spel där:
- En värd skapar ett rum och delar en kort kod
- Vänner ansluter på sina telefoner eller laptops
- Alla svarar på samma frågor samtidigt
- Snabbhet och rätt svar ger poäng
- En resultattavla visar slutliga placeringar

---

## Hur du jobbar

Beskriv för AI:n **vad du vill uppnå**, inte hur det ska lösas. Om AI:n frågar om preferenser — svara. Om den föreslår en lösning du inte förstår — be den förklara. Du leder, AI:n löser.

Använd `HACKDAY_PROMPTS.md` för färdiga startpunkter att klistra in i din AI-assistent.

---

## Steg 1 — Kom igång

**Mål:** Få upp en fungerande grund att bygga på.

Berätta för AI:n vad du vill bygga och fråga vad du behöver komma igång. Du kan nämna att du vill använda Node.js och TypeScript om du föredrar det, men låt AI:n föreslå hur projektet struktureras.

**Klart när:** Du kan starta en server och öppna en webbsida i browsern.

---

## Steg 2 — Spelare kan ansluta

**Mål:** Servern och klienten kan kommunicera i realtid.

**Klart när:** Du öppnar appen i en flik och kan se i terminalen att någon anslutit.

---

## Steg 3 — Skapa och gå med i rum

**Mål:** En spelare kan skapa ett rum och en annan kan gå med med hjälp av en kod.

**Klart när:** Du har två browserflikar öppna och kan se i båda att "Spelare X har anslutit".

---

## Steg 4 — Lobbyn

**Mål:** Spelarna ser varandra i ett väntrum och värden kan starta spelet.

**Klart när:** Värden ser en "Starta spel"-knapp, alla ser spelarlistans, och när värden klickar övergår alla flikar till nästa vy.

---

## Steg 5 — Frågor

**Mål:** Spelet har en samling sant/falskt-påståenden att ställa.

Skriv ett antal frågor om du vill — eller be AI:n komma på dem. Tänk på att blandning av ämnen och ungefär hälften sanna och hälften falska gör spelet mer intressant.

**Klart när:** Servern har frågor redo att använda.

---

## Steg 6 — Spelet

**Mål:** Spelarna får en fråga åt gången, svarar Sant eller Falskt, och får poäng beroende på om de svarade rätt och hur snabbt.

**Klart när:** Du kan spela igenom hela spelet från start till slut i två flikar.

---

## Steg 7 — Resultatsidan

**Mål:** När spelet är slut visas en resultattavla med placeringar.

**Klart när:** Du ser ett rankat resultat med poäng när sista frågan är besvarad. Värden kan starta om.

---

## Valfria förbättringar

Har du tid över? Välj något som verkar kul:

**Ledtrådar** — Lägg till en knapp som ger ledtrådar, men som minskar maxpoängen om man använder dem.

**Inställningar** — Låt värden välja antal frågor och tid per fråga innan spelet startar.

**AI-genererade frågor** — Generera unika frågor med ett AI-API varje gång ett spel startar.

**Driftsätt** — Lägg upp spelet online så att vem som helst kan spela.

---

## Tips

- **Jobba i ordning.** Varje steg bygger på föregående.
- **Testa i två flikar** från steg 3 och framåt för att simulera två spelare.
- **Beskriv vad du vill se**, inte hur du tror det bör lösas tekniskt.
- **Om något går sönder** — berätta för AI:n vad som händer (eller inte händer) och be den felsöka.
- **Commit ofta.** Det är lätt att återställa om något går fel.
