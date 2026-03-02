// ============================================================
// js/state.js — UI State
// ============================================================
// Holds only the questionnaire navigation state and the
// user's answers. No laptop data. No filtering. No scoring.
//
// lastResults stores the backend response for the export
// feature — it is never processed or re-scored here.
// ============================================================

let _state = {
  currentQuestionIndex: 0,
  hardConstraints:      {},   // { budget: 80000, os: 'Windows', ... }
  weights:              {},   // { 'cpu_performance': 3, 'ram(GB)': 2, ... }
  skipped:              [],   // question IDs the user skipped
  lastResults:          [],   // raw array from backend, for export only
};

// ── Getters ───────────────────────────────────────────────────

export const getCurrentIndex    = () => _state.currentQuestionIndex;
export const getHardConstraints = () => ({ ..._state.hardConstraints });
export const getWeights         = () => ({ ..._state.weights });
export const getSkipped         = () => [..._state.skipped];
export const getLastResults     = () => [..._state.lastResults];

// ── Setters ───────────────────────────────────────────────────

export function incrementIndex() { _state.currentQuestionIndex += 1; }

export function decrementIndex() {
  if (_state.currentQuestionIndex > 0) _state.currentQuestionIndex -= 1;
}

export function setHardConstraint(id, value) {
  _state.hardConstraints[id] = value;
}

export function setWeight(field, weight) {
  _state.weights[field] = weight;
}

export function markSkipped(id) {
  if (!_state.skipped.includes(id)) _state.skipped.push(id);
}

export function unmarkSkipped(id) {
  _state.skipped = _state.skipped.filter(x => x !== id);
}

export function setLastResults(results) {
  _state.lastResults = results;
}

export function resetState() {
  _state = {
    currentQuestionIndex: 0,
    hardConstraints:      {},
    weights:              {},
    skipped:              [],
    lastResults:          [],
  };
}
