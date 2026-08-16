'use strict';

const app = document.getElementById('app');
const aboutDialog = document.getElementById('aboutDialog');
const STORAGE_KEY = 'mrsKnoxLegalEACasefileV1';

let DATA = null;
let progress = loadProgress();
let rapidSession = null;
let sortSession = null;
let treatySession = null;
let bossSession = null;

const topicLabels = {
  foundations: 'Human-rights foundations',
  instruments: 'Treaties + instruments',
  treaties: 'Treaty process',
  australia: 'Human rights in Australia',
  analysis: 'Analysis',
  evaluation: 'Evaluation'
};

const ranks = [
  { min: 0, name: 'Brief Reader' },
  { min: 120, name: 'Junior Advocate' },
  { min: 300, name: 'Case Analyst' },
  { min: 600, name: 'Senior Counsel' },
  { min: 1000, name: 'EA Ready' }
];

function defaultProgress() {
  return {
    xp: 0,
    attempted: 0,
    correctFirst: 0,
    streak: 0,
    lastPlayed: null,
    completedModes: {},
    topicStats: {
      foundations: { attempted: 0, correct: 0 },
      instruments: { attempted: 0, correct: 0 },
      treaties: { attempted: 0, correct: 0 },
      australia: { attempted: 0, correct: 0 },
      analysis: { attempted: 0, correct: 0 },
      evaluation: { attempted: 0, correct: 0 }
    }
  };
}

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored ? mergeProgress(defaultProgress(), stored) : defaultProgress();
  } catch {
    return defaultProgress();
  }
}

function mergeProgress(base, stored) {
  return {
    ...base,
    ...stored,
    completedModes: { ...base.completedModes, ...(stored.completedModes || {}) },
    topicStats: Object.fromEntries(
      Object.keys(base.topicStats).map(k => [k, { ...base.topicStats[k], ...((stored.topicStats || {})[k] || {}) }])
    )
  };
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  updateHeader();
}

function currentRank() {
  return [...ranks].reverse().find(r => progress.xp >= r.min) || ranks[0];
}

function nextRank() {
  return ranks.find(r => r.min > progress.xp) || null;
}

function touchStreak() {
  const today = new Date();
  const ymd = today.toISOString().slice(0, 10);
  if (progress.lastPlayed === ymd) return;
  if (!progress.lastPlayed) {
    progress.streak = 1;
  } else {
    const prev = new Date(`${progress.lastPlayed}T00:00:00`);
    const cur = new Date(`${ymd}T00:00:00`);
    const diff = Math.round((cur - prev) / 86400000);
    progress.streak = diff === 1 ? progress.streak + 1 : 1;
  }
  progress.lastPlayed = ymd;
}

function awardXP(amount) {
  touchStreak();
  progress.xp += amount;
  saveProgress();
}

function recordMastery(topic, firstTryCorrect) {
  if (!progress.topicStats[topic]) progress.topicStats[topic] = { attempted: 0, correct: 0 };
  progress.topicStats[topic].attempted += 1;
  if (firstTryCorrect) progress.topicStats[topic].correct += 1;
  progress.attempted += 1;
  if (firstTryCorrect) progress.correctFirst += 1;
  saveProgress();
}

function completeMode(mode) {
  progress.completedModes[mode] = (progress.completedModes[mode] || 0) + 1;
  saveProgress();
}

function updateHeader() {
  const rankMini = document.getElementById('rankMini');
  const xpMini = document.getElementById('xpMini');
  if (rankMini) rankMini.textContent = currentRank().name.toUpperCase();
  if (xpMini) xpMini.textContent = progress.xp;
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setView(html) {
  app.innerHTML = html;
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function topbar(label, scoreText = '') {
  return `<div class="game-topbar">
    <div class="breadcrumb"><button class="ghost-btn" data-home type="button">← HOME</button><span>/</span><strong>${escapeHTML(label)}</strong></div>
    <div class="game-score">${scoreText ? `<span class="score-pill">${escapeHTML(scoreText)}</span>` : ''}<span class="score-pill">XP ${progress.xp}</span></div>
  </div>`;
}

function bindHomeButtons() {
  document.querySelectorAll('[data-home]').forEach(btn => btn.addEventListener('click', renderHome));
}

async function init() {
  setView('<div class="loading"><div><strong>OPENING CASE FILE…</strong><p>Loading the Legal EA question bank.</p></div></div>');
  try {
    const response = await fetch('data/game-data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    DATA = await response.json();
    updateHeader();
    renderHome();
  } catch (error) {
    setView(`<div class="error-box"><h2>Game data could not load</h2><p>This build is designed to run from GitHub Pages or a local web server. If you opened <code>index.html</code> directly from your computer, the browser may block the JSON question bank.</p><p><strong>For GitHub:</strong> upload the entire folder and enable Pages. For local testing: run <code>python -m http.server</code> in the folder.</p><p>Technical detail: ${escapeHTML(error.message)}</p></div>`);
  }
}

function renderHome() {
  rapidSession = sortSession = treatySession = bossSession = null;
  const rank = currentRank();
  const next = nextRank();
  const toNext = next ? Math.max(0, next.min - progress.xp) : 0;
  const nextPct = next ? Math.min(100, ((progress.xp - rank.min) / (next.min - rank.min)) * 100) : 100;
  const accuracy = progress.attempted ? Math.round((progress.correctFirst / progress.attempted) * 100) : 0;

  setView(`
    <section class="hero">
      <div class="hero-main">
        <span class="file-label">CASE FILE / EA PREP</span>
        <h1>BUILD THE KNOWLEDGE.<br>CRACK THE STIMULUS.</h1>
        <p>Train the three moves that matter: <strong>comprehend</strong> precisely, <strong>analyse</strong> viewpoints and consequences, then <strong>evaluate</strong> legal alternatives using criteria.</p>
        <button class="primary-btn" id="quickPractice" type="button">START QUICK PRACTICE</button>
        <div class="hero-kicker">
          <span class="kicker">UNIT 4 TOPIC 1</span>
          <span class="kicker">UNIT 4 TOPIC 3</span>
          <span class="kicker">2026 SYLLABUS ALIGNMENT</span>
          <span class="kicker">PROGRESS SAVES ON THIS DEVICE</span>
        </div>
      </div>
      <div class="hero-side">
        <div class="case-card">
          <span class="file-label">YOUR FILE</span>
          <h2>${escapeHTML(rank.name)}</h2>
          <p>${next ? `${toNext} XP until ${next.name}.` : 'Top rank reached. Keep sharpening your accuracy.'}</p>
          <div class="progress-track"><div class="progress-fill" style="width:${nextPct}%"></div></div>
          <div class="stat-grid">
            <div class="stat-box"><span>XP</span><strong>${progress.xp}</strong></div>
            <div class="stat-box"><span>STREAK</span><strong>${progress.streak || 0}</strong></div>
            <div class="stat-box"><span>FIRST-TRY</span><strong>${accuracy}%</strong></div>
            <div class="stat-box"><span>MODES CLEARED</span><strong>${Object.keys(progress.completedModes).length}/4</strong></div>
          </div>
        </div>
        <div class="case-card">
          <span class="file-label">CURRENT EA TARGET</span>
          <h2>Objectives 1 • 3 • 4</h2>
          <p>Current syllabus: human rights + human rights in Australian contexts. Short-response knowledge feeds stimulus analysis and evaluation.</p>
          <div class="ea-map">
            <div><strong>1</strong><span>Comprehend</span></div>
            <div><strong>3</strong><span>Analyse</span></div>
            <div><strong>4</strong><span>Evaluate</span></div>
          </div>
        </div>
      </div>
    </section>

    <div class="section-head">
      <div><span class="file-label">TRAINING FILES</span><h2>Choose your mode</h2></div>
      <p>Each mode rehearses a different part of the EA. The game rewards precise legal language and reasoning, not just fast clicking.</p>
    </div>

    <section class="mode-grid" aria-label="Study modes">
      <article class="mode-card" data-file="01">
        <div class="mode-icon">⚡</div>
        <h3>Rapid Recall</h3>
        <p>Human-rights terms, instruments, Australian protections and EA language. Immediate feedback explains why the answer is legally stronger.</p>
        <div class="mode-meta">10 RANDOM QUESTIONS • ~6 MIN</div>
        <button class="primary-btn" data-mode="rapid" type="button">OPEN FILE</button>
      </article>
      <article class="mode-card" data-file="02">
        <div class="mode-icon">▦</div>
        <h3>Sort the Case File</h3>
        <p>Sort rights, institutions and EA thinking moves. Built to attack the easy-to-confuse distinctions before the exam does.</p>
        <div class="mode-meta">3 SORTS • RIGHTS + ROLES + COGNITION</div>
        <button class="primary-btn" data-mode="sort" type="button">OPEN FILE</button>
      </article>
      <article class="mode-card" data-file="03">
        <div class="mode-icon">→</div>
        <h3>Treaty Process</h3>
        <p>Rebuild Australia’s treaty pathway and lock in signature, JSCOT, domestic implementation and ratification.</p>
        <div class="mode-meta">SEQUENCE + LEGAL MYTHS</div>
        <button class="primary-btn" data-mode="treaty" type="button">OPEN FILE</button>
      </article>
      <article class="mode-card" data-file="04">
        <div class="mode-icon">⚖</div>
        <h3>EA Boss Battle</h3>
        <p>Read a fictional Port Calder stimulus pack, determine nature and scope, trace viewpoints, select alternatives, apply criteria and make the call.</p>
        <div class="mode-meta">MINI UNSEEN STIMULUS • ~12 MIN</div>
        <button class="primary-btn" data-mode="boss" type="button">OPEN FILE</button>
      </article>
    </section>
  `);

  document.getElementById('quickPractice').addEventListener('click', startRapid);
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    if (mode === 'rapid') startRapid();
    if (mode === 'sort') startSort();
    if (mode === 'treaty') startTreaty();
    if (mode === 'boss') startBoss();
  }));
}

// RAPID RECALL
function startRapid() {
  rapidSession = {
    questions: shuffle(DATA.rapidRecall).slice(0, 10),
    index: 0,
    score: 0,
    firstTry: 0,
    attemptsThisQuestion: 0,
    wrongOptions: new Set(),
    resolved: false,
    xpStart: progress.xp
  };
  renderRapidQuestion();
}

function renderRapidQuestion() {
  const s = rapidSession;
  if (s.index >= s.questions.length) return renderRapidSummary();
  const q = s.questions[s.index];
  const pct = (s.index / s.questions.length) * 100;
  setView(`<div class="game-shell">
    ${topbar('Rapid Recall', `${s.index + 1}/${s.questions.length}`)}
    <div class="game-title"><span class="file-label">FILE 01 / RAPID RECALL</span><h1>Legal precision under pressure</h1><p>Choose the strongest answer. Wrong answers diagnose the misconception; correct answers give you the language upgrade.</p></div>
    <div class="progress-track" aria-label="Question progress"><div class="progress-fill" style="width:${pct}%"></div></div>
    <section class="question-card" aria-live="polite">
      <div class="question-num">QUESTION ${String(s.index + 1).padStart(2,'0')} • ${escapeHTML(q.sourceTag)}</div>
      <h2>${escapeHTML(q.prompt)}</h2>
      <div class="options">
        ${q.options.map((opt, i) => `<button class="option-btn ${s.wrongOptions.has(i) ? 'wrong' : ''}" data-answer="${i}" type="button" ${s.wrongOptions.has(i) || s.resolved ? 'disabled' : ''}>${String.fromCharCode(65+i)}. ${escapeHTML(opt)}</button>`).join('')}
      </div>
      <div id="rapidFeedback"></div>
    </section>
  </div>`);
  bindHomeButtons();
  document.querySelectorAll('[data-answer]').forEach(btn => btn.addEventListener('click', () => answerRapid(Number(btn.dataset.answer))));
  if (s.resolved) showRapidCorrect(q);
}

function answerRapid(choice) {
  const s = rapidSession;
  const q = s.questions[s.index];
  s.attemptsThisQuestion += 1;
  if (choice === q.answer) {
    const first = s.attemptsThisQuestion === 1;
    s.resolved = true;
    s.score += first ? 2 : 1;
    if (first) s.firstTry += 1;
    recordMastery(q.topic, first);
    awardXP(first ? 12 : 6);
    renderRapidQuestion();
  } else {
    s.wrongOptions.add(choice);
    const feedback = document.getElementById('rapidFeedback');
    feedback.innerHTML = `<div class="feedback-card error"><strong>Not quite.</strong><p>That option does not match the legal meaning being tested. Eliminate it and try again — you can still earn XP.</p></div>`;
    const btn = document.querySelector(`[data-answer="${choice}"]`);
    if (btn) { btn.classList.add('wrong'); btn.disabled = true; }
  }
}

function showRapidCorrect(q) {
  const feedback = document.getElementById('rapidFeedback');
  if (!feedback) return;
  feedback.innerHTML = `<div class="feedback-card"><strong>CASE NOTE: CORRECT</strong><p>${escapeHTML(q.explanation)}</p><div class="legal-upgrade"><strong>WHY THIS IS THE LEGAL STUDIES ANSWER</strong><br>${escapeHTML(q.upgrade)}</div><div class="feedback-actions"><button class="primary-btn" id="nextRapid" type="button">NEXT FILE →</button></div></div>`;
  document.querySelectorAll('[data-answer]').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('correct');
  });
  document.getElementById('nextRapid').addEventListener('click', () => {
    rapidSession.index += 1;
    rapidSession.attemptsThisQuestion = 0;
    rapidSession.wrongOptions = new Set();
    rapidSession.resolved = false;
    renderRapidQuestion();
  });
}

function renderRapidSummary() {
  completeMode('rapid');
  const s = rapidSession;
  const xpEarned = progress.xp - s.xpStart;
  setView(`<div class="game-shell">
    ${topbar('Rapid Recall complete')}
    <div class="summary-card question-card">
      <span class="file-label">FILE 01 / CLOSED</span>
      <h2 style="margin-top:18px">Rapid Recall complete</h2>
      <p>You answered <strong>${s.firstTry}/${s.questions.length}</strong> correctly on the first attempt and earned <strong>${xpEarned} XP</strong>.</p>
      <div class="stat-grid">
        <div class="stat-box"><span>FIRST-TRY ACCURACY</span><strong>${Math.round((s.firstTry/s.questions.length)*100)}%</strong></div>
        <div class="stat-box"><span>XP EARNED</span><strong>${xpEarned}</strong></div>
      </div>
      <div class="legal-upgrade"><strong>EA HABIT</strong><br>Do not stop at recognition. Practise saying what the concept, instrument or institution <em>does</em> and what legal effect follows.</div>
      <div class="feedback-actions"><button class="secondary-btn" id="againRapid">NEW RANDOM SET</button><button class="primary-btn" data-home>RETURN HOME</button></div>
    </div>
  </div>`);
  bindHomeButtons();
  document.getElementById('againRapid').addEventListener('click', startRapid);
}

// SORT MODE
function startSort() {
  sortSession = {
    setIndex: 0,
    placements: {},
    selected: null,
    checked: false,
    credited: new Set(),
    setCleared: false,
    xpStart: progress.xp
  };
  renderSort();
}

function currentSortSet() { return DATA.sortSets[sortSession.setIndex]; }

function renderSort() {
  const s = sortSession;
  if (s.setIndex >= DATA.sortSets.length) return renderSortSummary();
  const set = currentSortSet();
  const items = set.items.map((item, idx) => ({...item, key: `${set.id}-${idx}`}));
  const bank = items.filter(it => !s.placements[it.key]);
  setView(`<div class="game-shell">
    ${topbar('Sort the Case File', `SORT ${s.setIndex + 1}/${DATA.sortSets.length}`)}
    <div class="game-title"><span class="file-label">FILE 02 / SORT</span><h1>${escapeHTML(set.title)}</h1><p>${escapeHTML(set.instruction)} Click a card then a category, or drag it.</p></div>
    <section class="sort-bank">
      <h3>EVIDENCE BANK</h3>
      <div class="sort-items" id="sortBank">
        ${bank.length ? bank.map(it => `<button class="chip-btn ${s.selected === it.key ? 'selected' : ''}" draggable="true" data-item="${it.key}" type="button">${escapeHTML(it.text)}</button>`).join('') : '<span class="muted">All cards placed.</span>'}
      </div>
    </section>
    <section class="sort-grid">
      ${set.categories.map(cat => `<div class="sort-column" data-category="${escapeHTML(cat)}" tabindex="0"><h3>${escapeHTML(cat)}</h3>${items.filter(it => s.placements[it.key] === cat).map(it => {
        const cls = s.checked ? (it.category === cat ? 'correct' : 'wrong') : '';
        return `<button class="placed-item ${cls}" data-return="${it.key}" draggable="true" data-item="${it.key}" type="button">${escapeHTML(it.text)}</button>`;
      }).join('')}</div>`).join('')}
    </section>
    <div id="sortFeedback">${s.checked ? sortFeedbackHTML(items) : ''}</div>
    <div class="sort-actions">
      <button class="ghost-btn" id="resetSort" type="button">RESET THIS SORT</button>
      ${s.setCleared ? `<button class="primary-btn" id="nextSort" type="button">NEXT SORT →</button>` : `<button class="primary-btn" id="checkSort" type="button">CHECK CASE FILE</button>`}
    </div>
  </div>`);
  bindHomeButtons();
  bindSortEvents(items);
}

function bindSortEvents(items) {
  document.querySelectorAll('[data-item]').forEach(el => {
    el.addEventListener('click', e => {
      if (e.currentTarget.dataset.return && !sortSession.checked) {
        delete sortSession.placements[e.currentTarget.dataset.item];
        sortSession.selected = null;
        renderSort();
        return;
      }
      if (!sortSession.checked) {
        sortSession.selected = e.currentTarget.dataset.item;
        renderSort();
      }
    });
    el.addEventListener('dragstart', e => {
      if (sortSession.checked) return e.preventDefault();
      e.dataTransfer.setData('text/plain', e.currentTarget.dataset.item);
    });
  });
  document.querySelectorAll('[data-category]').forEach(col => {
    col.addEventListener('click', () => {
      if (sortSession.checked || !sortSession.selected) return;
      sortSession.placements[sortSession.selected] = col.dataset.category;
      sortSession.selected = null;
      renderSort();
    });
    col.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && sortSession.selected && !sortSession.checked) {
        e.preventDefault();
        sortSession.placements[sortSession.selected] = col.dataset.category;
        sortSession.selected = null;
        renderSort();
      }
    });
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drop-active'); });
    col.addEventListener('dragleave', () => col.classList.remove('drop-active'));
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drop-active');
      if (sortSession.checked) return;
      const key = e.dataTransfer.getData('text/plain');
      if (key) sortSession.placements[key] = col.dataset.category;
      renderSort();
    });
  });
  document.getElementById('resetSort').addEventListener('click', () => {
    sortSession.placements = {};
    sortSession.selected = null;
    sortSession.checked = false;
    sortSession.setCleared = false;
    renderSort();
  });
  const check = document.getElementById('checkSort');
  if (check) check.addEventListener('click', () => checkSort(items));
  const next = document.getElementById('nextSort');
  if (next) next.addEventListener('click', () => {
    sortSession.setIndex += 1;
    sortSession.placements = {};
    sortSession.selected = null;
    sortSession.checked = false;
    sortSession.credited = new Set();
    sortSession.setCleared = false;
    renderSort();
  });
}

function checkSort(items) {
  const s = sortSession;
  s.checked = true;
  let allPlaced = true;
  let allCorrect = true;
  let newlyCorrect = 0;
  items.forEach(it => {
    const placed = s.placements[it.key];
    if (!placed) { allPlaced = false; allCorrect = false; }
    if (placed !== it.category) allCorrect = false;
    if (placed === it.category && !s.credited.has(it.key)) {
      s.credited.add(it.key);
      newlyCorrect += 1;
    }
  });
  if (newlyCorrect) awardXP(newlyCorrect * 4);
  if (allCorrect && allPlaced) {
    s.setCleared = true;
    const topic = currentSortSet().id === 'sort-ea' ? 'analysis' : (currentSortSet().id === 'sort-rights' ? 'instruments' : 'australia');
    recordMastery(topic, true);
    awardXP(15);
  }
  renderSort();
}

function sortFeedbackHTML(items) {
  const set = currentSortSet();
  const wrong = items.filter(it => sortSession.placements[it.key] !== it.category).length;
  if (wrong === 0 && items.every(it => sortSession.placements[it.key])) {
    return `<div class="feedback-card"><strong>CASE FILE SORTED</strong><p>${escapeHTML(set.explanation)}</p></div>`;
  }
  sortSession.checked = false;
  return `<div class="feedback-card error"><strong>${wrong} card${wrong===1?'':'s'} need another look.</strong><p>Correct placements are green. Incorrect placements are red. Click an incorrect card to return it to the bank, then place it again.</p></div>`;
}

function renderSortSummary() {
  completeMode('sort');
  const earned = progress.xp - sortSession.xpStart;
  setView(`<div class="game-shell">${topbar('Sort complete')}<div class="question-card"><span class="file-label">FILE 02 / CLOSED</span><h2 style="margin-top:18px">Case file sorted</h2><p>You cleared all three sorts and earned <strong>${earned} XP</strong>.</p><div class="legal-upgrade"><strong>EA HABIT</strong><br>When two institutions sound similar, ask what each one actually <em>does</em> and what legal effect follows.</div><div class="feedback-actions"><button class="secondary-btn" id="againSort">SORT AGAIN</button><button class="primary-btn" data-home>RETURN HOME</button></div></div></div>`);
  bindHomeButtons();
  document.getElementById('againSort').addEventListener('click', startSort);
}

// TREATY PROCESS
function startTreaty() {
  let order = shuffle(DATA.treatyProcess.steps.map(s => s.id));
  const correct = DATA.treatyProcess.steps.map(s => s.id).join('|');
  if (order.join('|') === correct) order = [...order].reverse();
  treatySession = { order, checked: false, correct: false, hints: 0, mythIndex: 0, mythCorrect: 0, mythResolved: false, xpStart: progress.xp };
  renderTreaty();
}

function treatyStep(id) { return DATA.treatyProcess.steps.find(s => s.id === id); }

function renderTreaty() {
  const s = treatySession;
  const tp = DATA.treatyProcess;
  setView(`<div class="game-shell">
    ${topbar('Treaty Process', s.correct ? 'SEQUENCE CRACKED' : 'REORDER THE FILE')}
    <div class="game-title"><span class="file-label">FILE 03 / TREATY PATHWAY</span><h1>${escapeHTML(tp.title)}</h1><p>${escapeHTML(tp.instruction)}</p></div>
    <div class="process-list" id="processList">
      ${s.order.map((id, idx) => {
        const st = treatyStep(id);
        const correctHere = tp.steps[idx].id === id;
        const cls = s.checked ? (correctHere ? 'correct-pos' : 'wrong-pos') : '';
        return `<article class="process-card ${cls}" draggable="${!s.correct}" data-process-id="${id}" data-index="${idx}"><div class="process-index">${idx+1}</div><div class="process-copy"><strong>${escapeHTML(st.label)}</strong><span>${escapeHTML(st.detail)}</span></div><div class="move-controls"><button class="move-btn" data-up="${idx}" type="button" aria-label="Move ${escapeHTML(st.label)} up">↑</button><button class="move-btn" data-down="${idx}" type="button" aria-label="Move ${escapeHTML(st.label)} down">↓</button></div></article>`;
      }).join('')}
    </div>
    <div id="treatyFeedback">${s.checked ? treatyCheckFeedback() : ''}</div>
    <div class="sort-actions">
      ${!s.correct ? `<button class="ghost-btn" id="treatyHint" type="button">HINT</button><button class="secondary-btn" id="shuffleTreaty" type="button">SHUFFLE</button><button class="primary-btn" id="checkTreaty" type="button">CHECK SEQUENCE</button>` : ''}
    </div>
    ${s.correct ? `<section><div class="lock-grid">${tp.locks.map(lock => `<div class="lock-card">${escapeHTML(lock)}</div>`).join('')}</div>${renderMyth()}</section>` : ''}
  </div>`);
  bindHomeButtons();
  bindTreatyEvents();
}

function moveTreaty(from, to) {
  const s = treatySession;
  if (to < 0 || to >= s.order.length || s.correct) return;
  const [item] = s.order.splice(from, 1);
  s.order.splice(to, 0, item);
  s.checked = false;
  renderTreaty();
}

function bindTreatyEvents() {
  document.querySelectorAll('[data-up]').forEach(btn => btn.addEventListener('click', () => moveTreaty(Number(btn.dataset.up), Number(btn.dataset.up)-1)));
  document.querySelectorAll('[data-down]').forEach(btn => btn.addEventListener('click', () => moveTreaty(Number(btn.dataset.down), Number(btn.dataset.down)+1)));
  let dragFrom = null;
  document.querySelectorAll('[data-process-id]').forEach(card => {
    card.addEventListener('dragstart', e => { if (treatySession.correct) return e.preventDefault(); dragFrom = Number(card.dataset.index); card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    card.addEventListener('dragover', e => e.preventDefault());
    card.addEventListener('drop', e => { e.preventDefault(); const to = Number(card.dataset.index); if (dragFrom !== null && dragFrom !== to) moveTreaty(dragFrom, to); dragFrom = null; });
  });
  const check = document.getElementById('checkTreaty');
  if (check) check.addEventListener('click', checkTreaty);
  const hint = document.getElementById('treatyHint');
  if (hint) hint.addEventListener('click', treatyHint);
  const shuf = document.getElementById('shuffleTreaty');
  if (shuf) shuf.addEventListener('click', () => { treatySession.order = shuffle(treatySession.order); treatySession.checked = false; renderTreaty(); });
  document.querySelectorAll('[data-myth-answer]').forEach(btn => btn.addEventListener('click', () => answerMyth(btn.dataset.mythAnswer === 'true')));
  const nextMyth = document.getElementById('nextMyth');
  if (nextMyth) nextMyth.addEventListener('click', () => { treatySession.mythResolved = false; treatySession.mythIndex += 1; renderTreaty(); });
  const finish = document.getElementById('finishTreaty');
  if (finish) finish.addEventListener('click', renderTreatySummary);
}

function checkTreaty() {
  treatySession.checked = true;
  treatySession.correct = treatySession.order.every((id, i) => id === DATA.treatyProcess.steps[i].id);
  if (treatySession.correct) {
    const firstTry = treatySession.hints === 0;
    recordMastery('treaties', firstTry);
    awardXP(firstTry ? 45 : 30);
  }
  renderTreaty();
}

function treatyCheckFeedback() {
  if (treatySession.correct) return `<div class="feedback-card"><strong>PATHWAY CRACKED.</strong><p>Now lock in the three distinctions below before moving to the myths.</p></div>`;
  const positions = treatySession.order.filter((id, i) => id === DATA.treatyProcess.steps[i].id).length;
  treatySession.checked = false;
  return `<div class="feedback-card error"><strong>${positions}/${DATA.treatyProcess.steps.length} positions are correct.</strong><p>Green means the step is in the correct position. Red means it needs moving. Focus on what has to happen before Australia can take binding treaty action.</p></div>`;
}

function treatyHint() {
  const correct = DATA.treatyProcess.steps.map(s => s.id);
  const i = treatySession.order.findIndex((id, idx) => id !== correct[idx]);
  if (i < 0) return;
  const wanted = correct[i];
  const currentIndex = treatySession.order.indexOf(wanted);
  const [item] = treatySession.order.splice(currentIndex, 1);
  treatySession.order.splice(i, 0, item);
  treatySession.hints += 1;
  renderTreaty();
}

function renderMyth() {
  const s = treatySession;
  if (s.mythIndex >= DATA.treatyProcess.myths.length) {
    return `<div class="feedback-card"><strong>MYTH FILE CLEARED: ${s.mythCorrect}/3</strong><p>You have separated international commitment from domestic legal effect.</p><div class="feedback-actions"><button class="primary-btn" id="finishTreaty">CLOSE FILE</button></div></div>`;
  }
  const myth = DATA.treatyProcess.myths[s.mythIndex];
  if (s.mythResolved) {
    return `<div class="myth-card"><span class="file-label">LEGAL MYTH ${s.mythIndex+1}/3</span><h3 style="margin-top:14px">${escapeHTML(myth.statement)}</h3><div class="feedback-card"><p>${escapeHTML(myth.feedback)}</p></div><div class="feedback-actions"><button class="primary-btn" id="nextMyth">NEXT MYTH →</button></div></div>`;
  }
  return `<div class="myth-card"><span class="file-label">LEGAL MYTH ${s.mythIndex+1}/3</span><h3 style="margin-top:14px">${escapeHTML(myth.statement)}</h3><div class="truefalse"><button class="truefalse-btn" data-myth-answer="true">TRUE</button><button class="truefalse-btn" data-myth-answer="false">FALSE</button></div></div>`;
}

function answerMyth(value) {
  const myth = DATA.treatyProcess.myths[treatySession.mythIndex];
  if (value === myth.truth) { treatySession.mythCorrect += 1; awardXP(5); }
  treatySession.mythResolved = true;
  renderTreaty();
}

function renderTreatySummary() {
  completeMode('treaty');
  const earned = progress.xp - treatySession.xpStart;
  setView(`<div class="game-shell">${topbar('Treaty process complete')}<div class="question-card"><span class="file-label">FILE 03 / CLOSED</span><h2 style="margin-top:18px">Treaty pathway secured</h2><p>You earned <strong>${earned} XP</strong>.</p><div class="lock-grid">${DATA.treatyProcess.locks.map(x => `<div class="lock-card">${escapeHTML(x)}</div>`).join('')}</div><div class="feedback-actions"><button class="secondary-btn" id="againTreaty">RUN IT AGAIN</button><button class="primary-btn" data-home>RETURN HOME</button></div></div></div>`);
  bindHomeButtons();
  document.getElementById('againTreaty').addEventListener('click', startTreaty);
}

// BOSS BATTLE
function startBoss() {
  bossSession = { stageIndex: 0, selected: new Set(), attempts: 0, firstTryCorrect: 0, answers: {}, feedback: null, resolved: false, xpStart: progress.xp };
  renderBoss();
}

function renderStimuli() {
  const b = DATA.bossBattle;
  return `<div class="fiction-notice"><strong>FICTIONAL CLASSROOM STIMULUS</strong> — ${escapeHTML(b.fictionNotice)}</div><div class="source-card" style="margin-top:12px"><span class="source-label">SCENARIO</span><p>${escapeHTML(b.scenario)}</p><p><strong>Simulation legal background:</strong> ${escapeHTML(b.legalBackground)}</p></div><div class="source-stack">${b.stimuli.map(s => `<article class="source-card"><span class="source-label">${escapeHTML(s.id)} / ${escapeHTML(s.label)}</span><p>${escapeHTML(s.text)}</p></article>`).join('')}</div>`;
}

function renderBoss() {
  const s = bossSession;
  const b = DATA.bossBattle;
  if (s.stageIndex >= b.stages.length) return renderBossSummary();
  const stage = b.stages[s.stageIndex];
  const required = stage.type === 'multi' ? (stage.required || 2) : 1;
  setView(`<div class="game-shell">
    ${topbar('EA Boss Battle', `STAGE ${s.stageIndex + 1}/${b.stages.length}`)}
    <div class="game-title"><span class="file-label">FILE 04 / PORT CALDER</span><h1>${escapeHTML(b.title)}</h1><p>${escapeHTML(b.subtitle)}. Read the sources, then build the reasoning one move at a time.</p></div>
    ${renderStimuli()}
    <section class="question-card boss-stage">
      <div class="boss-stage-head"><div class="question-num">BOSS STAGE ${String(s.stageIndex + 1).padStart(2,'0')}</div><span class="skill-tag">${escapeHTML(stage.skill)}</span></div>
      <h2>${escapeHTML(stage.prompt)}</h2>
      ${stage.type === 'multi' ? `<div class="multi-note">Select ${required}. Then submit.</div>` : ''}
      <div class="options">
        ${stage.options.map((opt, i) => `<button class="option-btn ${s.selected.has(i) ? 'selected' : ''}" data-boss-option="${i}" type="button" ${s.resolved ? 'disabled' : ''}>${stage.type === 'multi' ? (s.selected.has(i) ? '✓ ' : '□ ') : `${String.fromCharCode(65+i)}. `}${escapeHTML(opt)}</button>`).join('')}
      </div>
      <div id="bossFeedback">${s.feedback ? bossFeedbackHTML(stage) : ''}</div>
      <div class="feedback-actions">${!s.resolved ? `<button class="primary-btn" id="submitBoss" type="button" ${s.selected.size !== required ? 'disabled' : ''}>SUBMIT LEGAL MOVE</button>` : `<button class="primary-btn" id="nextBoss" type="button">NEXT STAGE →</button>`}</div>
    </section>
  </div>`);
  bindHomeButtons();
  document.querySelectorAll('[data-boss-option]').forEach(btn => btn.addEventListener('click', () => selectBoss(Number(btn.dataset.bossOption), stage)));
  const submit = document.getElementById('submitBoss');
  if (submit) submit.addEventListener('click', () => submitBoss(stage));
  const next = document.getElementById('nextBoss');
  if (next) next.addEventListener('click', () => {
    s.stageIndex += 1;
    s.selected = new Set();
    s.attempts = 0;
    s.feedback = null;
    s.resolved = false;
    renderBoss();
  });
}

function selectBoss(index, stage) {
  if (bossSession.resolved) return;
  bossSession.feedback = null;
  if (stage.type === 'single') bossSession.selected = new Set([index]);
  else {
    if (bossSession.selected.has(index)) bossSession.selected.delete(index);
    else if (bossSession.selected.size < (stage.required || 2)) bossSession.selected.add(index);
  }
  renderBoss();
}

function bossSelectionCorrect(stage, selected) {
  const sel = [...selected].sort((a,b)=>a-b);
  if (stage.correctAny) return sel.length === (stage.required || 2) && sel.every(i => stage.correctAny.includes(i));
  const corr = [...stage.correct].sort((a,b)=>a-b);
  return sel.length === corr.length && sel.every((v,i) => v === corr[i]);
}

function submitBoss(stage) {
  const s = bossSession;
  s.attempts += 1;
  const correct = bossSelectionCorrect(stage, s.selected);
  if (correct) {
    const first = s.attempts === 1;
    if (first) s.firstTryCorrect += 1;
    s.resolved = true;
    s.feedback = { correct: true };
    s.answers[stage.skill] = [...s.selected].map(i => stage.options[i]);
    const topic = ['Nature + scope','Viewpoint 1 + consequence','Viewpoint 2 + consequence','Use of evidence'].includes(stage.skill) ? 'analysis' : 'evaluation';
    recordMastery(topic, first);
    awardXP(first ? 15 : 8);
    renderBoss();
  } else {
    s.feedback = { correct: false };
    s.selected = new Set();
    renderBoss();
  }
}

function bossFeedbackHTML(stage) {
  if (bossSession.feedback.correct) return `<div class="feedback-card"><strong>LEGAL MOVE ACCEPTED.</strong><p>${escapeHTML(stage.feedback)}</p></div>`;
  return `<div class="feedback-card error"><strong>That move is not yet defensible.</strong><p>Return to the stimulus and ask: what proposition am I trying to prove, and which option most directly does that legal job?</p></div>`;
}

function renderBossSummary() {
  completeMode('boss');
  awardXP(25);
  const s = bossSession;
  const b = DATA.bossBattle;
  const earned = progress.xp - s.xpStart;
  const pct = Math.round((s.firstTryCorrect / b.stages.length) * 100);
  setView(`<div class="game-shell">
    ${topbar('Boss battle complete')}
    <div class="game-title"><span class="file-label">FILE 04 / CLOSED</span><h1>EA plan assembled</h1><p>This is a thinking plan, not a model response. Your job in the exam is to turn these moves into precise paragraphs supported by the unseen stimulus.</p></div>
    <section class="question-card">
      <div class="stat-grid"><div class="stat-box"><span>FIRST-TRY STAGES</span><strong>${s.firstTryCorrect}/${b.stages.length}</strong></div><div class="stat-box"><span>XP EARNED</span><strong>${earned}</strong></div></div>
      <div class="skill-meter" aria-label="First-try skill score">${b.stages.map((_,i)=>`<span class="skill-segment ${i < s.firstTryCorrect ? 'on' : ''}"></span>`).join('')}</div>
      <p><strong>${pct}% first-try accuracy.</strong> Use the plan below to see the chain from analysis to evaluation.</p>
      <div class="boss-plan">${Object.entries(s.answers).map(([skill, answer]) => `<div class="plan-row"><strong>${escapeHTML(skill)}</strong><span>${answer.map(escapeHTML).join(' • ')}</span></div>`).join('')}</div>
      <div class="legal-upgrade"><strong>EA CHAIN</strong><br>Nature + scope → viewpoint 1 + consequence → viewpoint 2 + consequence → evidence → two legal alternatives → recommendation + legal criteria → implication.</div>
      <div class="feedback-actions"><button class="secondary-btn" id="againBoss">REPLAY BOSS</button><button class="primary-btn" data-home>RETURN HOME</button></div>
    </section>
  </div>`);
  bindHomeButtons();
  document.getElementById('againBoss').addEventListener('click', startBoss);
}

// PROGRESS DASHBOARD
function renderProgress() {
  const rank = currentRank();
  const next = nextRank();
  const accuracy = progress.attempted ? Math.round(progress.correctFirst/progress.attempted*100) : 0;
  const entries = Object.entries(progress.topicStats);
  setView(`<div class="game-shell progress-page">
    ${topbar('Progress dashboard')}
    <section class="rank-banner"><div><span class="file-label">YOUR LEGAL RANK</span><h1>${escapeHTML(rank.name)}</h1><p>${next ? `${next.min - progress.xp} XP to ${next.name}` : 'Top rank reached.'}</p></div><div class="rank-badge">${progress.xp}<br>XP</div></section>
    <div class="section-head"><div><h2>Mastery profile</h2></div><p>Mastery is based on first-try accuracy. It is a study signal, not a predicted QCAA mark.</p></div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)"><div class="stat-box"><span>TOTAL XP</span><strong>${progress.xp}</strong></div><div class="stat-box"><span>FIRST-TRY</span><strong>${accuracy}%</strong></div><div class="stat-box"><span>STREAK</span><strong>${progress.streak}</strong></div><div class="stat-box"><span>ITEMS ATTEMPTED</span><strong>${progress.attempted}</strong></div></div>
    <div class="mastery-grid">${entries.map(([key, val]) => {
      const pct = val.attempted ? Math.round(val.correct/val.attempted*100) : 0;
      return `<div class="mastery-row"><div class="mastery-row-head"><strong>${escapeHTML(topicLabels[key] || key)}</strong><span>${val.attempted ? pct+'%' : 'Not started'}</span></div><div class="mastery-bar"><span style="width:${pct}%"></span></div><small>${val.correct}/${val.attempted} first-try correct</small></div>`;
    }).join('')}</div>
    <div class="section-head"><div><h2>Files cleared</h2></div></div>
    <div class="ea-map"><div><strong>${progress.completedModes.rapid || 0}</strong><span>Rapid Recall clears</span></div><div><strong>${progress.completedModes.sort || 0}</strong><span>Sort clears</span></div><div><strong>${progress.completedModes.treaty || 0}</strong><span>Treaty clears</span></div><div><strong>${progress.completedModes.boss || 0}</strong><span>Boss clears</span></div></div>
    <div class="reset-area"><button class="ghost-btn" id="resetProgress">RESET PROGRESS ON THIS DEVICE</button></div>
  </div>`);
  bindHomeButtons();
  document.getElementById('resetProgress').addEventListener('click', () => {
    if (confirm('Reset all Casefile progress saved in this browser?')) {
      progress = defaultProgress();
      saveProgress();
      renderProgress();
    }
  });
}

// HEADER / MODAL

document.getElementById('homeBtn').addEventListener('click', () => DATA && renderHome());
document.getElementById('progressBtn').addEventListener('click', () => DATA && renderProgress());
document.getElementById('aboutBtn').addEventListener('click', () => aboutDialog.showModal());

init();
