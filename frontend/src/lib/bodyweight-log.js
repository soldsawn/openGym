// A weigh-in on any day, not only today (the log sheet's date wheel). The log keeps one weigh-in
// per day: a day that already has one gets the new number in its place, and the list stays in
// date order, which the chart, the weekly means and the Coach's window all read it in. Where it
// sits on a chart is lib/bodyweight.js weighInAt: on its day, not the moment it was typed.

/** The weigh-in logged on `iso`, or null. */
export const weighInOn = (list, iso) => (Array.isArray(list) ? list.find(b => b && b.d === iso) : null) || null

/**
 * Writes `w` on day `iso` into `list` in place and returns what happened: 'added' for a new day,
 * 'replaced' when the day already had a weigh-in. `t` is when it was typed, as every weigh-in
 * carries (sync keeps the newer of two copies of a day).
 */
export function logWeighIn(list, iso, w, t = Date.now()) {
  const ex = weighInOn(list, iso)
  if (ex) { ex.w = w; ex.t = t }
  else list.push({ d: iso, w, t })
  list.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0))
  return ex ? 'replaced' : 'added'
}
