import { describe, it, expect } from 'vitest'
import { prSetRows } from './set-prs.js'

const entry = sets => ({ id: 'bench', sets })
const rows = (sets, prev) => [...prSetRows(entry(sets), prev, 'epley')].sort()

describe('prSetRows', () => {
  it('marks the first done row with a heavier load than ever', () => {
    expect(rows([{ w: 50, r: 5, done: true }, { w: 50, r: 5, done: true }], { w: 45, est: 100 })).toEqual([0])
  })

  it('marks the heaviest row, not every row over the old best', () => {
    expect(rows([{ w: 50, r: 3, done: true }, { w: 55, r: 3, done: true }], { w: 45, est: 100 })).toEqual([1])
  })

  it('marks a better estimated 1RM at the same load (more reps)', () => {
    // 50 × 11 (Epley 68.3) beats a best estimate of 60 without a heavier load than 55.
    expect(rows([{ w: 50, r: 11, done: true }, { w: 50, r: 7, done: true }], { w: 55, est: 60 })).toEqual([0])
  })

  it('marks two rows when the load and the estimate are beaten on different sets', () => {
    expect(rows([{ w: 50, r: 12, done: true }, { w: 60, r: 1, done: true }], { w: 55, est: 65 })).toEqual([0, 1])
  })

  it('leaves unticked sets and warm-ups out', () => {
    expect(rows([{ w: 80, r: 5, done: false }, { w: 70, r: 5, done: true, phase: 'warmup' }], { w: 45, est: 60 })).toEqual([])
  })

  it('marks nothing when no record is beaten', () => {
    expect(rows([{ w: 40, r: 5, done: true }], { w: 45, est: 60 })).toEqual([])
  })

  it('counts a per-side set by its done sides', () => {
    const side = { w: 0, r: 0, done: false, sides: { L: { w: 30, r: 8, done: true }, R: { w: 30, r: 8, done: false } } }
    expect(rows([side], { w: 25, est: 100 })).toEqual([0])
  })

  it('treats a first session as a record, as the finish summary does', () => {
    expect(rows([{ w: 20, r: 5, done: true }], {})).toEqual([0])
  })
})
