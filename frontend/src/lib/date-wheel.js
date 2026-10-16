// The date wheel's arithmetic (components/DateWheel.jsx): a day as its year, month and day, put
// back together inside the days the month has and never past `max` — a weigh-in cannot be logged
// for tomorrow. Dates are ISO strings (YYYY-MM-DD), the way the log stores them.

const pad2 = n => String(n).padStart(2, '0')

/** Days in month `m` (1–12) of year `y`. */
export const daysInMonth = (y, m) => new Date(y, m, 0).getDate()

/** '2026-10-17' → { y: 2026, m: 10, d: 17 } */
export function partsOf(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return { y, m, d }
}

/**
 * The day the wheels land on: the day cut to the month's length (31 March → 30 April, not 1 May),
 * then pulled back to `max` and up to `min` when it falls outside them.
 */
export function joinParts({ y, m, d }, { min, max } = {}) {
  const day = Math.max(1, Math.min(d, daysInMonth(y, m)))
  const iso = `${y}-${pad2(m)}-${pad2(day)}`
  if (max && iso > max) return max
  if (min && iso < min) return min
  return iso
}

/**
 * The order the three wheels stand in for `locale`: day · month · year in Turkish, month · day ·
 * year in American English, year first in Chinese. Read from how the locale writes a date.
 */
export function fieldOrder(locale) {
  try {
    const parts = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(new Date(2026, 9, 17))
    const order = parts.map(p => p.type).filter(type => type === 'day' || type === 'month' || type === 'year')
    if (order.length === 3) return order
  } catch { /* an unknown locale: the default below */ }
  return ['day', 'month', 'year']
}

/** The months' names in `locale`, January first. */
export function monthNames(locale) {
  try {
    const f = new Intl.DateTimeFormat(locale, { month: 'long' })
    return Array.from({ length: 12 }, (_, i) => f.format(new Date(2026, i, 1)))
  } catch {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  }
}
