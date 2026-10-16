import { describe, expect, it } from 'vitest'
import { logWeighIn, weighInOn } from './bodyweight-log.js'

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

  it('finds the weigh-in of a day, and nothing for a day without one', () => {
    const list = [{ d: '2026-09-16', w: 80, t: 1 }]
    expect(weighInOn(list, '2026-09-16')).toEqual({ d: '2026-09-16', w: 80, t: 1 })
    expect(weighInOn(list, '2026-09-17')).toBeNull()
    expect(weighInOn(undefined, '2026-09-17')).toBeNull()
  })
})
