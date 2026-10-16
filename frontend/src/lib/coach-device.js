// Mobile build only: how the Coach runs on this phone, and the little it keeps between runs.
//
// Deliberately NOT part of S. S is the training log — it syncs to a paired server, travels in
// the JSON export, and is what "back up your data" means. Which provider this phone talks to,
// the pseudonym it uses, today's run count and a proposal waiting to be looked at are device
// facts, so they live in their own file next to the remote-pairing one. The API key itself is
// not even here: see coach-secrets.js.
//
// This module is intentionally light. The setup screen imports it before the user has chosen
// anything, and the promise there is that nothing AI-shaped loads until they do.
import { readJsonFile, writeJsonFile } from './mobile.js'

const FILE = 'opengym-coach.json'

export const COACH_MODES = ['off', 'server', 'byok']

// The two limits a person can set for their own account: how many Coach requests a day this
// phone makes, and how long one answer may be (the provider's output-token ceiling). Stored as
// null until they are changed, so a phone that never touched them keeps following the default.
export const DAILY_CAP_DEFAULT = 50
export const DAILY_CAP_MIN = 1
export const DAILY_CAP_MAX = 500
// 16000 is what api/coach/core/adapters/http.js asks for when nothing is passed.
export const MAX_TOKENS_DEFAULT = 16000
export const MAX_TOKENS_MIN = 1000
export const MAX_TOKENS_MAX = 64000

/** A whole number inside [min, max]; anything that is not a number, or is empty, is `fallback`. */
export function clampInt(value, min, max, fallback) {
  if (value == null || String(value).trim() === '') return fallback
  const n = Math.round(Number(value))
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}
export const dailyCapOf = d => clampInt(d && d.dailyCap, DAILY_CAP_MIN, DAILY_CAP_MAX, DAILY_CAP_DEFAULT)
export const maxTokensOf = d => clampInt(d && d.maxTokens, MAX_TOKENS_MIN, MAX_TOKENS_MAX, MAX_TOKENS_DEFAULT)

const DEFAULTS = { mode: 'off', provider: null, model: null, baseUrl: null, handle: null, daily: null, pending: null, dailyCap: null, maxTokens: null }

let cache = null
export async function loadCoachDevice() {
  if (cache) return cache
  const saved = await readJsonFile(FILE)
  cache = { ...DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) }
  if (!COACH_MODES.includes(cache.mode)) cache.mode = 'off'
  return cache
}
export async function saveCoachDevice(patch) {
  const next = { ...(await loadCoachDevice()), ...patch }
  cache = next
  await writeJsonFile(FILE, next)
  return next
}
/** The part of it a UI may show: never the pending proposal, never the handle. */
export const coachDeviceSettings = d => d ? { mode: d.mode, provider: d.provider, model: d.model, baseUrl: d.baseUrl } : null

// Test seam.
export function _resetCoachDevice() { cache = null }
