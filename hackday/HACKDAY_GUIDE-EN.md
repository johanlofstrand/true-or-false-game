# Hackday Guide: Build a Multiplayer Game with AI

Build a real-time quiz game using an AI coding assistant. Each step describes **what to achieve** and **how you'll know you're done**. You don't need to know the technical solution in advance — that's what the AI is for.

---

## What you're building

A real-time game where:
- A host creates a room and shares a short code
- Friends join on their phones or laptops
- Everyone answers the same questions simultaneously
- Speed and correctness earn you points
- A leaderboard shows the final rankings

---

## How to work

Tell the AI **what you want to achieve**, not how to solve it. If the AI asks about your preferences — answer it. If it suggests something you don't understand — ask it to explain. You lead, the AI solves.

Use `HACKDAY_PROMPTS-EN.md` for ready-made prompts to paste into your AI assistant.

---

## Step 1 — Get started

**Goal:** Get a working foundation to build on.

Tell the AI what you want to build and ask what you need to get started. You can mention that you want to use Node.js and TypeScript if you have a preference, but let the AI suggest how to structure the project.

**Done when:** You can start a server and open a web page in the browser.

---

## Step 2 — Players can connect

**Goal:** The server and client can communicate in real time.

**Done when:** You open the app in a browser tab and can see in the terminal that someone connected.

---

## Step 3 — Create and join rooms

**Goal:** A player can create a room and another can join using a code.

**Done when:** You have two browser tabs open and both show "Player X has joined".

---

## Step 4 — The lobby

**Goal:** Players see each other in a waiting room and the host can start the game.

**Done when:** The host sees a "Start Game" button, everyone sees the player list, and when the host clicks it all tabs transition to the next view.

---

## Step 5 — Questions

**Goal:** The game has a collection of true/false statements to ask.

Write some questions yourself if you like — or ask the AI to come up with them. A mix of topics and roughly half true and half false makes the game more interesting.

**Done when:** The server has questions ready to use.

---

## Step 6 — The game

**Goal:** Players get one question at a time, answer True or False, and earn points based on correctness and speed.

**Done when:** You can play through an entire game from start to finish across two browser tabs.

---

## Step 7 — Results screen

**Goal:** When the game ends, a leaderboard with rankings is shown.

**Done when:** You see a ranked result with scores after the last question. The host can start a new game.

---

## Optional extras

Got time to spare? Pick something that sounds fun:

**Hints** — Add a button that reveals hints, but using them reduces the maximum score.

**Settings** — Let the host choose the number of questions and time per question before the game starts.

**AI-generated questions** — Generate unique questions via an AI API each time a game starts.

**Deploy** — Put the game online so anyone can play.

---

## Tips

- **Work in order.** Each step builds on the previous one.
- **Test in two tabs** from step 3 onwards to simulate two players.
- **Describe what you want to see**, not how you think it should be solved technically.
- **If something breaks** — tell the AI what is (or isn't) happening and ask it to debug.
- **Commit often.** It's easy to recover if something goes wrong.
