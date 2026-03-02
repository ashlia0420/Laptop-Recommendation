

import { QUESTIONS } from './questions.js';

// Section IDs
const ID_LANDING       = 'section-landing';
const ID_QUESTIONNAIRE = 'section-questionnaire';
const ID_RESULTS       = 'section-results';

// Container IDs
const ID_QUESTION      = 'question-container';
const ID_PROGRESS_FILL = 'progress-fill';
const ID_PROGRESS_LBEL = 'progress-label';
const ID_RESULTS_LIST  = 'results-list';
const ID_SUMMARY_TAGS  = 'summary-tags';

// ── Section visibility ─────────────────────────────────────────

export function showLanding() {
  _show(ID_LANDING);
  _hide(ID_QUESTIONNAIRE);
  _hide(ID_RESULTS);
}

export function showQuestionnaire() {
  _hide(ID_LANDING);
  _show(ID_QUESTIONNAIRE);
  _hide(ID_RESULTS);
  document.getElementById(ID_QUESTIONNAIRE)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function showResults() {
  _hide(ID_LANDING);
  _hide(ID_QUESTIONNAIRE);
  _show(ID_RESULTS);
  document.getElementById(ID_RESULTS)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Progress bar ───────────────────────────────────────────────

export function updateProgress(current, total) {
  const pct = Math.round((current / total) * 100);
  const fill  = document.getElementById(ID_PROGRESS_FILL);
  const label = document.getElementById(ID_PROGRESS_LBEL);
  if (fill)  fill.style.width  = `${pct}%`;
  if (label) label.textContent = `Step ${current} of ${total}`;
}

// ── Question rendering ─────────────────────────────────────────

export function renderQuestion(index, savedAnswer) {
  const container = document.getElementById(ID_QUESTION);
  if (!container) return;
  container.innerHTML = '';

  const q = QUESTIONS[index];
  if (!q) return;

  let widget;
  if      (q.inputType === 'number')     widget = _buildNumber(q, savedAnswer);
  else if (q.inputType === 'select')     widget = _buildSelect(q, savedAnswer);
  else if (q.inputType === 'importance') widget = _buildImportance(q, savedAnswer);
  else                                   widget = _buildNumber(q, savedAnswer);

  const slot = document.createElement('div');
  slot.className = `question-slot question-slot--${q.inputType}`;
  slot.dataset.questionId = q.id;
  slot.appendChild(widget);
  container.appendChild(slot);

  const btnBack = document.getElementById('btn-back');
  const btnSkip = document.getElementById('btn-skip');
  if (btnBack) btnBack.style.visibility = index === 0 ? 'hidden' : 'visible';
  if (btnSkip) btnSkip.style.display    = q.required  ? 'none'   : 'inline-block';
}

function _buildNumber(q, saved) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <label class="question-label" for="q-${q.id}">${_esc(q.label)}</label>
    <p class="question-hint">${_esc(q.hint)}</p>
    <div class="number-input-wrap">
      <input class="question-number-input" type="number"
        id="q-${q.id}"
        placeholder="${_esc(q.placeholder || '')}"
        min="${q.min || 0}" max="${q.max || 999999}"
        value="${saved != null ? saved : ''}"
        autocomplete="off" />
      ${q.unit ? `<span class="input-unit">${_esc(q.unit)}</span>` : ''}
    </div>`;
  return wrap;
}

function _buildSelect(q, saved) {
  // If no saved answer, start with a blank placeholder so the select
  // has no pre-selected value — forcing the user to actively choose
  // before Continue will accept it.
  const hassaved = saved !== undefined && saved !== null;
  const placeholder = hassaved
    ? ''
    : `<option value="" disabled selected>Select an option…</option>`;

  const opts = q.options.map(o => {
    const sel = hassaved && String(saved) === String(o.value) ? 'selected' : '';
    return `<option value="${_esc(String(o.value))}" ${sel}>${_esc(o.label)}</option>`;
  }).join('');

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <label class="question-label" for="q-${q.id}">${_esc(q.label)}</label>
    <p class="question-hint">${_esc(q.hint)}</p>
    <select class="question-select" id="q-${q.id}">${placeholder}${opts}</select>`;
  return wrap;
}

function _buildImportance(q, saved) {
  const desc = {
    High:   '— this is a top priority for me',
    Medium: '— this matters somewhat',
    Low:    "— I don't mind either way",
  };
  const opts = ['High', 'Medium', 'Low'].map(level => `
    <label class="radio-option">
      <input class="radio-option__input" type="radio"
        name="q-${q.id}" value="${level}"
        ${saved === level ? 'checked' : ''} />
      <span class="radio-option__text">
        <strong>${level}</strong>
        <span class="importance-desc">${desc[level]}</span>
      </span>
    </label>`).join('');
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <fieldset class="question-fieldset">
      <legend class="question-label">${_esc(q.label)}</legend>
      <p class="question-hint">${_esc(q.hint)}</p>
      <div class="radio-group">${opts}</div>
    </fieldset>`;
  return wrap;
}

// ── Answer reading ─────────────────────────────────────────────

export function readCurrentAnswer(index) {
  const q = QUESTIONS[index];
  if (!q) return null;

  if (q.inputType === 'number') {
    const el  = document.getElementById(`q-${q.id}`);
    if (!el || !el.value.trim()) return null;
    const num = parseFloat(el.value);
    return isNaN(num) ? null : num;
  }

  if (q.inputType === 'select') {
    const el = document.getElementById(`q-${q.id}`);
    return el && el.value !== "" ? el.value : null;
  }

  if (q.inputType === 'importance') {
    const el = document.querySelector(`input[name="q-${q.id}"]:checked`);
    return el ? el.value : null;
  }

  return null;
}

// ── Results rendering ──────────────────────────────────────────
// Renders the array returned by the backend as-is.

export function renderResults(results) {
  const list = document.getElementById(ID_RESULTS_LIST);
  if (!list) return;
  list.innerHTML = '';

  if (!results || results.length === 0) {
    list.innerHTML = `
      <div class="no-results">
        <p class="no-results__title">No laptops matched your criteria</p>
        <p class="no-results__message">
          Your hard constraints may be too strict.
          Try relaxing your budget, minimum RAM, or storage requirements.
        </p>
      </div>`;
    return;
  }

  results.forEach((result, i) => list.appendChild(_buildCard(result, i + 1)));
}

function _buildCard(r, rank) {
  const isTop      = rank === 1;
  const scoreRaw   = r.score;
  const score      = Math.round(scoreRaw);
  // Minimum bar width of 4% so it's always visible, even at score 0
  const barWidth   = Math.max(score, scoreRaw > 0 ? 4 : 0);
  // const scoreLabel = scoreRaw > 0 ? `${score} / 100` : 'No score — sorted by price';

  
  // Strength bullets
  const strengthsHTML = (r.strengths || [])
    .map(s => `<li class="explanation-item">${_esc(s)}</li>`)
    .join('');

  // Trade-off warnings
  const tradeoffsHTML = (r.tradeoffs || [])
    .map(t => `<li class="explanation-item explanation-item--tradeoff">${_esc(t)}</li>`)
    .join('');

  const article       = document.createElement('article');
  article.className   = `result-card${isTop ? ' result-card--top' : ''}`;
  article.setAttribute('aria-label', `Rank ${rank}: ${r.brand} ${r.model}`);

  article.innerHTML = `
    <div class="result-card__rank">
      <span class="rank-number">${rank}</span>
      <span class="rank-label">${_esc(r.rank_label || '')}</span>
    </div>
    <div class="result-card__body">
      <h3 class="result-card__name">${_esc(`${r.model}`.trim())}</h3>

      <div class="result-card__meta-row">
        <span>₹${_fmt(r.price)}</span>
        <span>${_esc(r.os || '')}</span>
        <span>${r.ram_gb} GB RAM</span>
        <span>${r.total_storage_gb} GB Storage</span>
        <span>${_esc(r.processor || '')}</span>
      </div>

      

      <p class="result-card__explanation">${_esc(r.explanation || '')}</p>

      ${strengthsHTML || tradeoffsHTML ? `
        <ul class="explanation-list">
          ${strengthsHTML}
          ${tradeoffsHTML}
        </ul>` : ''}
    </div>`;

  return article;
}


// ── Preference summary tags ────────────────────────────────────

export function renderSummaryTags(hardConstraints, weights, skipped) {
  const container = document.getElementById(ID_SUMMARY_TAGS);
  if (!container) return;
  container.innerHTML = '';

  const LABELS = {
    'cpu_performance':     'Performance',
    'ram(GB)':             'RAM',
    'total_storage_GB':    'Storage',
    'ssd(GB)':             'SSD',
    'screen_size(inches)': 'Display',
  };

  const tags = [];

  if (hardConstraints.budget)
    tags.push(`Budget: ₹${_fmt(hardConstraints.budget)}`);
  if (hardConstraints.os && hardConstraints.os !== 'any')
    tags.push(`OS: ${hardConstraints.os}`);
  if (hardConstraints.min_ram > 0)
    tags.push(`Min RAM: ${hardConstraints.min_ram} GB`);
  if (hardConstraints.min_storage > 0)
    tags.push(`Min Storage: ${hardConstraints.min_storage} GB`);

  for (const [field, w] of Object.entries(weights)) {
    if (w >= 2) {
      const label    = LABELS[field] || field;
      const priority = w === 3 ? 'High priority' : 'Medium priority';
      tags.push(`${label}: ${priority}`);
    }
  }


  if (!tags.length)
    tags.push('No preferences set');

  tags.forEach(text => {
    const span       = document.createElement('span');
    span.className   = 'summary-tag';
    span.textContent = text;
    container.appendChild(span);
  });
}

// ── Error / status messages ────────────────────────────────────

export function showQuestionError(msg) {
  const c = document.getElementById(ID_QUESTION);
  if (!c) return;
  c.querySelector('.inline-error')?.remove();
  const el = document.createElement('p');
  el.className = 'inline-error';
  el.setAttribute('role', 'alert');
  el.textContent = msg;
  c.prepend(el);
}

export function clearQuestionError() {
  document.getElementById(ID_QUESTION)?.querySelector('.inline-error')?.remove();
}

export function showLoadingResults(msg = 'Calculating recommendations…') {
  const list = document.getElementById(ID_RESULTS_LIST);
  if (list) list.innerHTML = `<p class="loading-message">${_esc(msg)}</p>`;
}

export function showFatalError(msg) {
  const c = document.getElementById(ID_QUESTION);
  if (!c) return;
  c.innerHTML = `
    <div class="fatal-error">
      <p class="fatal-error__title">Something went wrong</p>
      <p class="fatal-error__message">${_esc(msg)}</p>
      <p class="fatal-error__hint">
        Ensure the backend is running at <code>http://localhost:8000</code>
        and check the browser console for details.
      </p>
    </div>`;
}

// ── Private helpers ────────────────────────────────────────────

function _show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

function _hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function _fmt(n) {
  if (n == null) return 'N/A';
  return Number(n).toLocaleString('en-IN');
}

function _esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}