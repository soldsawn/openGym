import { describe, expect, it } from 'vitest'
import { logWeighIn, weighInOn } from './bodyweight-log.js'
import { weighInAt } from './bodyweight.js'

describe('a weigh-in on any day', () => {
  it('adds a past day in date order, not at the end', () => {
    const list = [{ d: '2026-09-01', w: 80, t: 1 }, { d: '2026-10-17', w: 81.5, t: 2 }]
    expect(logWeighIn(list, '2026-09-16', 80.4, 3)).toBe('added')
    expect(list.map(b => b.d)).toEqual(['2026-09-01', '2026-09-16', '2026-10-17'])
    expect(list[1]).toEqual({ d: '2026-09-16', w: 80.4, t: 3 })
  })

  it('keeps one weigh-in a day: a day that has one gets the new number in its place', () => {
    const list = [{ d: '2026-09-16', w: 80, t: 1 }]
    expect(logWeighIn(list, '2026-09-16', 79.6, 5)).toBe('replaced')
    expect(list).toEqual([{ d: '2026-09-16', w: 79.6, t: 5 }])
  })

  it('a weigh-in typed over an imported one is no longer marked as imported', () => {
    const list = [{ d: '2026-09-16', w: 80, t: 1, src: 'health' }]
    logWeighIn(list, '2026-09-16', 79.6, 5)
    expect(list).toEqual([{ d: '2026-09-16', w: 79.6, t: 5 }])
  })

  // The flat curve on Home: July's weigh-ins typed in October were plotted at their `t`, all on
  // the same October night, so the line ran from one pile to the next.
  it('sits on a chart at the day it is for, not the moment it was typed', () => {
    const typedTonight = new Date('2026-10-17T02:00:00').getTime()
    const july = { d: '2026-07-12', w: 75.4, t: typedTonight }
    expect(weighInAt(july)).toBe(new Date('2026-07-12T12:00:00').getTime())
    const log = [july, { d: '2026-08-29', w: 80.3, t: typedTonight }, { d: '2026-10-14', w: 81.5, t: new Date('2026-10-14T08:00:00').getTime() }]
    const xs = log.map(weighInAt)
    expect([...xs].sort((a, b) => a - b)).toEqual(xs)          // in date order along the axis
    expect(new Set(xs).size).toBe(3)                           // none piled on another
  })

  it('finds the weigh-in of a day, and nothing for a day without one', () => {
    const list = [{ d: '2026-09-16', w: 80, t: 1 }]
    expect(weighInOn(list, '2026-09-16')).toEqual({ d: '2026-09-16', w: 80, t: 1 })
    expect(weighInOn(list, '2026-09-17')).toBeNull()
    expect(weighInOn(undefined, '2026-09-17')).toBeNull()
  })
})
