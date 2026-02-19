# Hackday Prompts — True or False

Ready-made starting points for each step. Paste them into your AI assistant and continue the conversation from there. Feel free to adjust the wording and details.

> **Tip:** Read through the response before moving on. If something is unclear — ask before continuing.

---

## Step 1 — Get started

```
I want to build a multiplayer quiz game where players answer True or False to statements in real time. What do I need to get started? I want to use Node.js and TypeScript. Help me set up a project from scratch and explain what you choose and why.
```

---

## Step 2 — Players can connect

```
I have a server and a basic web page running. Now I want them to communicate with each other in real time — not with regular HTTP requests, but more like a persistent open connection, the way games or chat apps work. How do I do that? Set up the minimum needed to show it's working.
```

---

## Step 3 — Create and join rooms

```
I want a player to be able to create a game room and share a short code (like four letters) with their friends. The others type in the code and end up in the same room. Everyone in the room should see when someone new joins. How do I build that?
```

---

## Step 4 — The lobby

```
Now that players can join a room, I want a waiting screen — a lobby. All players in the room should see each other. The player who created the room is the host and should have a button to start the game. The button shouldn't be clickable if there's only one player. When the host starts, all players should move to the next view. How do I build that?
```

---

## Step 5 — Questions

```
I need a collection of true/false statements to use in the game. Come up with 20 questions covering different topics — science, history, geography, animals, culture. About half should be true and half false. The false ones should ideally be common misconceptions rather than obviously wrong. Add them to the project so the server can pick a random selection when a game starts.
```

---

## Step 6 — The game

```
Now I want to build the actual game loop. Here's how it should work:

- All players see the same statement at the same time
- There's a countdown timer
- Each player presses True or False
- Correct and fast answers score the most points
- When everyone has answered (or time runs out), the answer and scores are shown
- Then the next question appears

How do I build that? Start by explaining your approach before writing any code.
```

---

## Step 7 — Results screen

```
When all questions have been answered, I want to show a results screen with a ranking — who got the most points, number of correct answers, and average response time. The host should be able to start a new game. Everyone should be able to leave and return to the start screen. How do I build that?
```

---

## Optional extras

### Hints

```
I want to add hints. A player can ask for a hint during a question, but it costs them — the maximum score decreases with each hint used. Three levels: vague, medium, specific. How do I add that?
```

### Settings

```
I want the host to be able to change game settings in the lobby before the game starts — like number of questions and time per question. Other players should see the current settings but not be able to change them. How do I do that?
```

### AI-generated questions

```
I want the game to generate fresh unique questions each time via an AI API, instead of using hardcoded questions. If the API call fails it should fall back to the regular questions. How do I add that?
```

### Deploy

```
I want to put the game online so anyone can play via a link. What's the easiest free way to do that? Walk me through the whole process.
```

---

## When something goes wrong

**Real-time communication isn't working:**
```
The client seems to connect but nothing happens on the server when I send messages. How do I debug this? What should I check on the client side and on the server side?
```

**Game state is getting out of sync:**
```
It looks like different players are seeing different things — the timer is off, or scores aren't updating the same for everyone. What could cause that and how do I fix it?
```

**Build errors or TypeScript errors:**
```
I'm getting this error: [paste the error]. Help me understand what it means and fix it without changing how the game works.
```

**Deployment is failing:**
```
The deployment is failing with this error: [paste the error]. Help me understand what's wrong and how to fix it.
```
