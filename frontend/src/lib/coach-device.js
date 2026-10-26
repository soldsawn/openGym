// Mobile build only: how the Coach runs on this phone, and the little it keeps between runs.
//
// Deliberately NOT part of S. S is the training log — it syncs to a paired server, travels in
// the JSON export, and is what "back up your data" means. Which provider this phone talks to,
// the pseudonym it uses, today's run count and a proposal waiting to be looked at are device
// facts, so they live in their own file next to the remote-pairing one. So is when it last ran a
// review (`reviewedAt`): the marker its automatic reviews are timed from (coach-local.js). The API key itself is
// not even here: see coach-secrets.js.
//
// This module is intentionally light. The setup screen imports it before the user has chosen
// anything, and the promise there is that nothing AI-shaped loads until they do.
import { readJsonFile, writeJsonFile } from './mobile.js'

const FILE = 'opengym-coach.json'

export const COACH_MODES = ['off', 'server', 'byok']

const DEFAULTS = { mode: 'off', provider: null, model: null, baseUrl: null, handle: null, daily: null, pending: null, reviewedAt: null, limits: null }

/* The three dials the BYOK setup screen's "Advanced" exposes, with the same ranges the server's
   admin card clamps to (api/coach/config.js). That file is node-only — it reads ./data and
   encrypts credentials — so the phone restates the numbers here rather than importing it; the
   three defaults are what the phone already did before the dials existed. `daily` 0 means no
   limit, exactly as the instance cap does. */
export const COACH_LIMITS = {
  maxOutputTokens: { def: 16000, min: 1024, max: 65536 },
  daily: { def: 10, min: 0, max: 200 },
  maxMessageLen: { def: 1000, min: 200, max: 4000 }
}
export const clampCoachLimit = (key, value) => {
  const c = COACH_LIMITS[key]
  const n = Math.round(Number(value))
  return Number.isFinite(n) ? Math.max(c.min, Math.min(c.max, n)) : c.def
}
/** The effective dials, every one clamped and defaulted — the only shape the Coach reads. */
export const coachLimits = d => {
  const l = (d && d.limits) || {}
  const out = {}
  for (const key of Object.keys(COACH_LIMITS)) out[key] = clampCoachLimit(key, l[key] ?? COACH_LIMITS[key].def)
  return out
}

/* Before 1.4.3 this fork kept its own two limits, `dailyCap` and `maxTokens`, beside the file's
   other fields. A phone that set them keeps its numbers: they move into `limits` once, clamped to
   the ranges above, and the old fields are dropped. A dial already in `limits` wins. */
export function fromForkLimits(saved) {
  if (!saved || typeof saved !== 'object' || !('dailyCap' in saved || 'maxTokens' in saved)) return saved
  const { dailyCap, maxTokens, ...rest } = saved
  const moved = {}
  if (dailyCap != null && String(dailyCap).trim() !== '') moved.daily = clampCoachLimit('daily', dailyCap)
  if (maxTokens != null && String(maxTokens).trim() !== '') moved.maxOutputTokens = clampCoachLimit('maxOutputTokens', maxTokens)
  if (!Object.keys(moved).length) return rest
  return { ...rest, limits: { ...moved, ...(rest.limits || {}) } }
}

let cache = null
export async function loadCoachDevice() {
  if (cache) return cache
  const saved = fromForkLimits(await readJsonFile(FILE))
  cache = { ...DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) }
  if (!COACH_MODES.includes(cache.mode)) cache.mode = 'off'
  return cache
}
export async function saveCoachDevice(patch) {
  const cur = await loadCoachDevice()
  const next = { ...cur, ...patch }
  // A hand-edited file (or a caller that skipped a clamp) must not leave an out-of-range dial
  // behind: the stored object is always the clamped one, merged with whatever was there before.
  if (patch && patch.limits) next.limits = coachLimits({ limits: { ...coachLimits(cur), ...patch.limits } })
  cache = next
  await writeJsonFile(FILE, next)
  return next
}
/** The part of it a UI may show: never the pending proposal, never the handle. */
export const coachDeviceSettings = d => d ? { mode: d.mode, provider: d.provider, model: d.model, baseUrl: d.baseUrl, limits: coachLimits(d) } : null

// Test seam.
export function _resetCoachDevice() { cache = null }
