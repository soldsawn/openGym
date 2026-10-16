// A weigh-in on any day, not only today (the log sheet's date wheel). The log keeps one weigh-in
// per day: a day that already has one gets the new number in its place, and the list stays in
// date order, which the chart, the weekly means and the Coach's window all read it in.

/**
 * Where a weigh-in sits on a time axis: noon of the day it is for. Not `t`, the moment it was
 * typed — that is the sync's stamp, and a weigh-in logged today for a day in July has a `t` of
 * today: plotted by it, a month of back-filled weigh-ins piled up on one day and the curve went
 * flat. Noon keeps the day the same in every time zone.
 */
export const weighInTime = b => new Date(b.d + 'T12:00:00').getTime()

/** A weigh-in as a chart point (components/LineChart.jsx), on the day it is for. */
export const weighInPoint = b => ({ t: weighInTime(b), y: b.w, d: b.d })

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
