// A date on three scroll wheels — day, month and year, in the order the app's language writes a
// date — for a weigh-in on a day other than today (the body-weight log sheet). Built on the rest
// timer's WheelColumn, so it scrolls, snaps, clicks and reads out the way that wheel does, and it
// takes its colours from the same theme variables.
//
//   <DateWheel value="2026-10-17" onChange={setIso} max={todayISO()} />
//
// Days after `max` are shown faded and the wheel rolls back from them; a month too short for the
// day picked (31 → April) lands on its last day. `min` defaults to ten years before `max`.
import { useMemo, useRef, useState } from 'react'
import { t, dateLocale } from '../lib/i18n.js'
import { daysInMonth, fieldOrder, joinParts, monthNames, partsOf } from '../lib/date-wheel.js'
import { WheelColumn } from './DurationWheel.jsx'

export default function DateWheel({ value, onChange, max, min }) {
  const locale = dateLocale()
  const top = partsOf(max)
  const lowest = min || `${top.y - 10}-01-01`
  const first = partsOf(lowest).y
  const { y, m, d } = partsOf(value)
  const [nonce, setNonce] = useState(0)
  const live = useRef({ y, m, d })
  live.current = { y, m, d }
  const names = useMemo(() => monthNames(locale), [locale])
  const order = useMemo(() => fieldOrder(locale), [locale])

  const pick = patch => {
    const next = joinParts({ ...live.current, ...patch }, { min: lowest, max })
    setNonce(n => n + 1)            // the wheels go back to the day that was kept, if it was moved
    if (next !== value) onChange(next)
  }
  const after = (yy, mm, dd) => joinParts({ y: yy, m: mm, d: dd }) > max
  const text = new Date(value + 'T12:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

  const columns = {
    day: <WheelColumn key="day" count={daysInMonth(y, m)} index={d - 1} nonce={nonce} step={7}
      onPick={i => pick({ d: i + 1 })} label={t('Day')} valueText={text} format={i => String(i + 1)}
      disabledAt={i => after(y, m, i + 1)} />,
    month: <WheelColumn key="month" className="dw-month" count={12} index={m - 1} nonce={nonce} step={3}
      onPick={i => pick({ m: i + 1 })} label={t('Month')} valueText={text} format={i => names[i]}
      disabledAt={i => after(y, i + 1, 1)} />,
    year: <WheelColumn key="year" count={top.y - first + 1} index={y - first} nonce={nonce} step={5}
      onPick={i => pick({ y: first + i })} label={t('Year')} valueText={text} format={i => String(first + i)} />,
  }
  return (
    <div className="dw dw-date" data-nodrag="">
      <span className="dw-band" aria-hidden="true" />
      {order.map(field => columns[field])}
    </div>
  )
}
