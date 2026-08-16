# Legal EA: Casefile — Version 1

A static GitHub Pages study game for **Queensland Year 12 Legal Studies External Assessment preparation**.

## What Version 1 includes

- **Rapid Recall** — 10 random questions from a 30-question bank with misconception feedback and a “why this is the Legal Studies answer” upgrade.
- **Sort the Case File** — three interactive sorts: rights/instruments, institutions/roles, and Analyse vs Evaluate.
- **Treaty Process** — reorder the Australian treaty pathway, use hints, then complete legal-myth checks.
- **EA Boss Battle** — a fictional Port Calder unseen-stimulus simulation that walks students through nature and scope, viewpoints/consequences, evidence, legal alternatives, criteria, recommendation and implication.
- **Progress dashboard** — browser-local XP, rank, streak and first-try mastery by topic.

## Curriculum alignment

Built against **QCAA Legal Studies 2025 v1.3 General senior syllabus (January 2026)**. The current external assessment relates to **Unit 4 Topic 1: Human rights** and **Unit 4 Topic 3: Human rights in Australian contexts**, assessing:

1. Comprehend legal concepts, principles and processes
3. Analyse a legal issue
4. Evaluate a legal situation

The 2025 QCAA external assessment and marking guide are used as practice models for short-response and stimulus-based analysis/evaluation.

## GitHub Pages setup

1. Create a new GitHub repository (for example `legal-ea-casefile`).
2. Upload the **contents of this folder** to the repository root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data/game-data.json`
3. Commit the files.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`, then save.
7. GitHub will give you the public Pages URL.

No build tools, npm packages, database or student accounts are required.

## Local testing

Because the question bank is loaded from JSON, opening `index.html` directly may be blocked by browser security. Run a tiny local server instead:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Editing the question bank

All content is in `data/game-data.json`.

### Rapid Recall

Add an object to `rapidRecall` with:

```json
{
  "id": "rr31",
  "topic": "australia",
  "prompt": "Your question",
  "options": ["A", "B", "C", "D"],
  "answer": 1,
  "explanation": "Why the answer is correct.",
  "upgrade": "The precise Legal Studies wording students should learn.",
  "sourceTag": "Unit 4 Topic 3"
}
```

`answer` uses zero-based numbering: `0` = first option, `1` = second option, etc.

### Sorts

Edit the `sortSets` array. Each item has a `category` that must exactly match one of the set's categories.

### Treaty pathway

Edit `treatyProcess.steps`. The order in the JSON file is the correct order used by the game.

### Boss Battle

Edit `bossBattle.stimuli` and `bossBattle.stages`. Keep fictional classroom stimuli clearly labelled as fictional and verify any real legal propositions before adding them.

## Progress/privacy

Progress is stored only in the student's browser using `localStorage`. Version 1 does **not** collect names, accounts, analytics or student responses.

Students can reset their device-local progress from the Progress dashboard.

## Source basis

- QCAA, *Legal Studies 2025 v1.3 General senior syllabus*, January 2026.
- QCAA, *External assessment 2025 — Legal Studies question and response book*.
- QCAA, *Legal Studies marking guide and response — External assessment 2025*.
- Mrs Knox Week 1–3 EA preparation materials.
- Mrs Knox treaty-making, parliamentary human-rights scrutiny, Commonwealth power/limits and Chapter III EA preparation resources.

QCAA materials used as source material are © State of Queensland (QCAA) and supplied under the licence stated in the source documents. This game is an independent classroom study resource and is **not an official QCAA product**.

---

**Created by Mrs Knox**
