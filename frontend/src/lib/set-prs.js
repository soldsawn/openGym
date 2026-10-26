import { beatsWeight, isAssisted } from './exercises.js'
import { isSideSet, isWarmupRow } from './workout-model.js'
import { estimate1RM } from './onerm.js'

// The rows of an exercise in the running session that set a record, so a ticked set can show
// "PR" in place of its number. The same two records the finish summary reports: the heaviest
// load ever (bestWeightFor) and the best estimated 1RM ever (best1RM). `prev` is that history,
// { w, est }, read without this session. Each record marks one row, the first done row that
// reached the session's best, and only when it beats `prev`. Warm-ups never count, and a
// per-side set counts by its done sides.
export function prSetRows(entry, prev = {}, formula) {
  const id = entry?.id
  const assisted = isAssisted(id)
  const doneParts = s => (isSideSet(s) ? [s.sides.L, s.sides.R].filter(x => x?.done === true) : s?.done === true ? [s] : [])
  let wRow = -1, wBest = 0, eRow = -1, eBest = 0
  ;(entry?.sets || []).forEach((s, i) => {
    if (isWarmupRow(s)) return
    doneParts(s).forEach(p => {
      const w = Number(p.w) || 0
      if (beatsWeight(id, w, wBest)) { wRow = i; wBest = w }
      const est = assisted ? null : estimate1RM(p.w, p.r, formula, p.rir ?? null)
      if (est != null && est > eBest) { eRow = i; eBest = est }
    })
  })
  const rows = new Set()
  if (wRow >= 0 && beatsWeight(id, wBest, prev.w || 0)) rows.add(wRow)
  if (eRow >= 0 && eBest > (prev.est || 0)) rows.add(eRow)
  return rows
}
