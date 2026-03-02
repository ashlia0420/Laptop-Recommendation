// ============================================================
// js/main.js — Application Orchestrator
// ============================================================
// Responsibilities:
//   1. Wire all button events
//   2. Step through the questionnaire
//   3. Collect answers into a payload
//   4. POST payload to /api/recommend
//   5. Pass the response to uiController to render
//
// ============================================================

import { QUESTIONS, IMPORTANCE_MAP } from './questions.js';

import {
  getCurrentIndex,
  incrementIndex,
  decrementIndex,
  setHardConstraint,
  setWeight,
  markSkipped,
  unmarkSkipped,
  getHardConstraints,
  getWeights,
  getSkipped,
  setLastResults,
  getLastResults,
  resetState,
} from './state.js';

import {
  showLanding,
  showQuestionnaire,
  showResults,
  updateProgress,
  renderQuestion,
  readCurrentAnswer,
  renderResults,
  renderSummaryTags,
  showQuestionError,
  clearQuestionError,
  showLoadingResults,
  showFatalError,
} from './uiController.js';

// ── Backend endpoint ───────────────────────────────────────────
// During development the backend runs on localhost:8000.
// In production, deploy frontend and backend on the same origin
// and change this to a relative path: '/api/recommend'
const API_URL = 'http://localhost:8000/api/recommend';

// ── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showLanding();
  _wireButtons();
});

// ── Button wiring ──────────────────────────────────────────────
function _wireButtons() {
  document.getElementById('btn-start')
    ?.addEventListener('click', _onStart);
  document.getElementById('btn-continue')
    ?.addEventListener('click', _onContinue);
  document.getElementById('btn-back')
    ?.addEventListener('click', _onBack);
  document.getElementById('btn-skip')
    ?.addEventListener('click', _onSkip);
  document.getElementById('btn-restart')
    ?.addEventListener('click', _onRestart);
  document.getElementById('btn-export')
    ?.addEventListener('click', _onExport);
}

// ── Handlers ───────────────────────────────────────────────────

function _onStart() {
  showQuestionnaire();
  _renderCurrent();
}

function _onContinue() {
  clearQuestionError();

  const idx = getCurrentIndex();
  const q   = QUESTIONS[idx];
  if (!q) return;

  const answer = readCurrentAnswer(idx);

  // Validate
  // if (q.required && (answer === null || answer === undefined))
  if (answer === null || answer === undefined || answer === '') {
    showQuestionError('Kindly provide an answer, or use the Skip button if you’d like to move on.');
    return;
  }
  if (q.id === 'budget' && (typeof answer !== 'number' || answer <= 0)) {
    showQuestionError('Please enter a valid budget greater than zero.');
    return;
  }

  // Save to state
  _saveAnswer(q, answer);
  unmarkSkipped(q.id);

  // Advance or submit
  if (idx >= QUESTIONS.length - 1) {
    _submit();
  } else {
    incrementIndex();
    _renderCurrent();
  }
}

function _onBack() {
  clearQuestionError();
  decrementIndex();
  _renderCurrent();
}

function _onSkip() {
  clearQuestionError();
  const idx = getCurrentIndex();
  const q   = QUESTIONS[idx];
  if (!q) return;
  markSkipped(q.id);

  if (idx >= QUESTIONS.length - 1) {
    _submit();
  } else {
    incrementIndex();
    _renderCurrent();
  }
}

function _onRestart() {
  resetState();
  showLanding();
}

function _onExport() {
  const results = getLastResults();
  if (!results.length) return;

  const text = _exportText(results, getHardConstraints(), getWeights());
  const blob  = new Blob([text], { type: 'text/plain' });
  const url   = URL.createObjectURL(blob);
  const a     = Object.assign(document.createElement('a'), {
    href:     url,
    download: 'larec-summary.txt',
  });
  a.click();
  URL.revokeObjectURL(url);
}

// ── Questionnaire helpers ──────────────────────────────────────

function _renderCurrent() {
  const idx = getCurrentIndex();
  const q   = QUESTIONS[idx];
  if (!q) return;
  updateProgress(idx + 1, QUESTIONS.length);
  renderQuestion(idx, _savedAnswer(q));
}

function _savedAnswer(q) {
  if (q.type === 'hard') return getHardConstraints()[q.id];
  if (q.type === 'soft') {
    const w = getWeights()[q.field];
    if (w === undefined) return undefined;
    return Object.keys(IMPORTANCE_MAP).find(k => IMPORTANCE_MAP[k] === w);
  }
  return undefined;
}

function _saveAnswer(q, answer) {
  if (answer == null) return;
  if (q.type === 'hard') {
    const numericHardFields = ["min_ram", "min_storage"];
    const val = (q.inputType === "number" || numericHardFields.includes(q.id)) ? Number(answer) : answer;
    setHardConstraint(q.id, val);
  }
  if (q.type === 'soft') {
    const w = IMPORTANCE_MAP[answer];
    if (w !== undefined) setWeight(q.field, w);
  }
}

// ── Backend call ───────────────────────────────────────────────

/**
 * Collects the user's answers into a JSON payload,
 * POSTs it to /api/recommend, and renders the response.
 *
 * No decision logic runs here — the backend does everything.
 */
async function _submit() {
  const hardConstraints = getHardConstraints();
  const softPreferences = getWeights();
  const skipped         = getSkipped();

  const payload = { hard_constraints: hardConstraints, soft_preferences: softPreferences };

  // Show the results page immediately with a loading indicator
  showResults();
  showLoadingResults();

  try {
    const response = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Backend returned status ${response.status}`);
    }

    const { results } = await response.json();

    // Store raw results for export (no processing done here)
    setLastResults(results || []);

    // Hand everything to uiController — it renders, nothing more
    renderSummaryTags(hardConstraints, softPreferences, skipped);
    renderResults(results || []);

  } catch (err) {
    console.error('[LareC] API error:', err);
    // Go back to questionnaire section to show the error in-context
    showQuestionnaire();
    showFatalError(err.message);
  }
}

// ── Export text ────────────────────────────────────────────────
function _exportText(results, hardConstraints, weights) {
  const D    = '─'.repeat(50);
  const lines = [
    'LareC — Laptop Recommendation Summary',
    `Generated: ${new Date().toLocaleString()}`,
    D,
    '',
    'YOUR CONSTRAINTS',
  ];

  if (hardConstraints.budget)
    lines.push(`  Budget:       ₹${Number(hardConstraints.budget).toLocaleString('en-IN')}`);
  if (hardConstraints.os && hardConstraints.os !== 'any')
    lines.push(`  OS:           ${hardConstraints.os}`);
  if (hardConstraints.min_ram > 0)
    lines.push(`  Min RAM:      ${hardConstraints.min_ram} GB`);
  if (hardConstraints.min_storage > 0)
    lines.push(`  Min Storage:  ${hardConstraints.min_storage} GB`);

  lines.push('', 'YOUR PRIORITIES');
  for (const [field, w] of Object.entries(weights)) {
    const level = w === 3 ? 'High' : w === 2 ? 'Medium' : 'Low';
    lines.push(`  ${field.padEnd(24)} ${level}`);
  }

  lines.push('', D, 'TOP RECOMMENDATIONS', D);

  results.forEach((r, i) => {
    lines.push(
      '',
      `#${i + 1}  ${r.brand} ${r.model}`,
      `    Score:      ${Math.round(r.score)} / 100`,
      `    Price:      ₹${Number(r.price).toLocaleString('en-IN')}`,
      `    OS:         ${r.os}`,
      `    Processor:  ${r.processor}`,
      `    RAM:        ${r.ram_gb} GB`,
      `    SSD:        ${r.ssd_gb} GB`,
      `    HDD:        ${r.hdd_gb} GB`,
      `    Display:    ${r.screen_size}"`,
      `    Why:        ${r.explanation}`,
    );
  });

  lines.push('', D, 'Generated by LareC — rule-based decision support. No AI used.');
  return lines.join('\n');
}