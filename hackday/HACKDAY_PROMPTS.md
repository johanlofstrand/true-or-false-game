# Hackday Prompts — Sant eller Falskt

Färdiga startpunkter för varje steg. Klistra in dem i din AI-assistent och fortsätt samtalet därifrån. Anpassa gärna språk och detaljer.

> **Tips:** Läs igenom svaret innan du går vidare. Förstår du inte något — fråga innan du fortsätter.

---

## Steg 1 — Kom igång

```
Jag vill bygga ett multiplayer-quizspel där spelare i realtid svarar Sant eller Falskt på påståenden. Vad behöver jag för att komma igång? Jag vill använda Node.js och TypeScript. Hjälp mig sätta upp ett projekt från scratch och förklara vad du väljer och varför.
```

---

## Steg 2 — Spelare kan ansluta

```
Jag har fått upp en server och en enkel webbsida. Nu vill jag att de ska kunna kommunicera med varandra i realtid — inte med vanliga HTTP-anrop utan mer som ett konstant uppkopplat flöde, som i ett spel eller en chatt. Hur löser jag det? Sätt upp det minsta möjliga för att visa att det fungerar.
```

---

## Steg 3 — Skapa och gå med i rum

```
Jag vill att en spelare ska kunna skapa ett spelrum och dela en kort kod (t.ex. fyra bokstäver) med sina vänner. De andra skriver in koden och hamnar i samma rum. Alla i rummet ska se när någon ny ansluter. Hur bygger jag det?
```

---

## Steg 4 — Lobbyn

```
Nu när spelare kan gå med i ett rum vill jag ha en väntskärm — en lobby. Alla spelare i rummet ska se varandra. Den som skapade rummet är värden och ska ha en knapp för att starta spelet. Knappen ska inte gå att klicka om det bara är en spelare. När värden startar, ska alla spelare gå vidare till nästa vy. Hur bygger jag det?
```

---

## Steg 5 — Frågor

```
Jag behöver en samling sant/falskt-påståenden att använda i spelet. Kom på 20 frågor som täcker olika ämnen — vetenskap, historia, geografi, djur, kultur. Ungefär hälften ska vara sanna och hälften falska. De falska ska gärna vara vanliga missuppfattningar snarare än uppenbart fel. Lägg in dem i projektet så att servern kan plocka ut ett slumpmässigt urval när ett spel börjar.
```

---

## Steg 6 — Spelet

```
Nu vill jag bygga själva spelloopen. Så här ska det fungera:

- Alla spelare får se samma påstående samtidigt
- Det finns en nedräkningstimer
- Varje spelare trycker Sant eller Falskt
- Den som svarar rätt och snabbast får mest poäng
- När alla svarat (eller tiden är ute) visas svaret och poängen
- Sedan kommer nästa fråga

Hur bygger jag det? Börja med att förklara hur du tänker lägga upp det innan du skriver kod.
```

---

## Steg 7 — Resultatsidan

```
När alla frågor är besvarade vill jag visa en resultatsida med en rankinglista — vem fick mest poäng, antal rätt, och snitt-svarstid. Den som skapade rummet ska kunna starta om. Alla ska kunna lämna och komma tillbaka till startsidan. Hur bygger jag det?
```

---

## Valfria förbättringar

### Ledtrådar

```
Jag vill lägga till ledtrådar. Spelaren kan be om en ledtråd under en fråga, men det kostar — maxpoängen minskar ju fler ledtrådar man tar. Tre nivåer: vag, medel, specifik. Hur lägger jag till det?
```

### Inställningar

```
Jag vill att värden ska kunna ändra spelinställningar i lobbyn innan spelet startar — t.ex. antal frågor och tid per fråga. Andra spelare ska se de aktuella inställningarna men inte kunna ändra dem. Hur gör jag det?
```

### AI-genererade frågor

```
Jag vill att spelet genererar nya unika frågor varje gång via ett AI-API, istället för att använda de hårdkodade frågorna. Om API-anropet misslyckas ska det falla tillbaka på de vanliga frågorna. Hur lägger jag till det?
```

### Driftsätt

```
Jag vill lägga upp spelet online så att vem som helst kan spela via en länk. Vad är enklaste sättet att göra det gratis? Hjälp mig genom hela processen.
```

---

## Om något inte fungerar

**Realtidskommunikationen fungerar inte:**
```
Klienten verkar ansluta men ingenting händer på servern när jag skickar meddelanden. Hur felsöker jag det? Vad ska jag titta på på klient- respektive serversidan?
```

**Spelstatus blir osynkroniserad:**
```
Det verkar som att olika spelare ser olika saker — timern stämmer inte, eller poängen uppdateras inte lika för alla. Vad kan orsaka det och hur fixar jag det?
```

**Byggfel eller TypeScript-fel:**
```
Jag får det här felet: [klistra in felet]. Hjälp mig förstå vad det betyder och fixa det utan att ändra hur spelet fungerar.
```

**Driftsättningen misslyckas:**
```
Deployingen misslyckas med det här felet: [klistra in felet]. Hjälp mig förstå vad som är fel och hur jag fixar det.
```
