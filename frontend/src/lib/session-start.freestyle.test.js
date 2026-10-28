// Freestyle progression (fork): a freestyle session has no routine, so the rule comes from one
// setting (S.freestyleProg), or from the exercise's own `prog`. Without either it repeats last
// time, as it always did. Exercises are added and finished the way the app does it (Workout.jsx
// addExercise: freestyleSeed, then buildSessionEntry), so the history has the shape the app saves.
import { describe, it, expect } from 'vitest'
import { buildSessionEntry, freestyleSeed, freestyleProgresses } from './session-start.js'
import { buildCompletedWorkout } from './finish-workout.js'
import { pickedExerciseConfig } from './history.js'
import { isWarmupRow } from './workout-model.js'

const BENCH = '0025'   // barbell bench press, 2.5 kg step
const work = e => e.sets.filter(s => !isWarmupRow(s))
const state = (extra = {}) => ({ unit: 'kg', exWeights: {}, routines: [], workouts: [], week: {}, dayPlan: {}, ...extra })

let day = 1
// What the add flow builds: the seed the sheet opens with, edited by `edit`, then the entry.
function add(st, edit = {}) {
  const seed = freestyleSeed(st, { id: BENCH, ...pickedExerciseConfig(BENCH) })
  return { id: BENCH, ...buildSessionEntry(st, BENCH, { ...seed, ...edit }, null, null) }
}
// Finishes a freestyle session with every work set logged at `reps` (and `w`, when given).
function train(st, entry, reps, w) {
  const done = { ...entry, sets: entry.sets.map(s => (isWarmupRow(s) ? { ...s, done: true } : { ...s, r: reps, ...(w != null ? { w } : {}), done: true })) }
  const d = `2026-09-${String(day).padStart(2, '0')}`
  const active = { id: 'f' + day, d, start: day * 1000, routineIds: [], name: 'Freestyle', entries: [done] }
  day++
  st.workouts.push(buildCompletedWorkout(active, { end: active.start + 1 }))
}

describe('freestyle progression', () => {
  it('is off by default and for a profile that never chose', () => {
    expect(freestyleProgresses({}, { id: BENCH, sets: 2, reps: 8 })).toBe(false)
    expect(freestyleProgresses({ freestyleProg: 'off' }, { id: BENCH, sets: 2, reps: 8 })).toBe(false)
    expect(freestyleProgresses({ freestyleProg: 'double' }, { id: BENCH, sets: 2, reps: 8 })).toBe(true)
    // The exercise's own rule wins either way.
    expect(freestyleProgresses({}, { id: BENCH, sets: 2, reps: 8, prog: 'double' })).toBe(true)
    expect(freestyleProgresses({ freestyleProg: 'double' }, { id: BENCH, sets: 2, reps: 8, prog: 'off' })).toBe(false)
  })

  it('off, repeats last time and prescribes nothing', () => {
    const st = state()
    train(st, add(st, { sets: 2, reps: 8, weight: 60 }), 8, 60)
    const next = add(st)
    expect(next.plan).toBeNull()
    expect(work(next).map(s => [s.w, s.r])).toEqual([[60, 8], [60, 8]])
  })

  it('double: the top of the range in every set raises the weight, reps back to the bottom', () => {
    const st = state({ freestyleProg: 'double' })
    train(st, add(st, { sets: 2, reps: 8, repsMin: 6, weight: 60 }), 8, 60)
    const next = add(st)
    expect(next.plan.policy).toBe('double')
    expect(next.plan.kind).toBe('up')
    expect(work(next).map(s => [s.w, s.r])).toEqual([[62.5, 6], [62.5, 6]])
  })

  it('double: keeps progressing over sessions, reading the same plan each time', () => {
    const st = state({ freestyleProg: 'double' })
    train(st, add(st, { sets: 2, reps: 8, repsMin: 6, weight: 60 }), 8, 60)
    const second = add(st)
    // The sheet opens at the plan (6–8), not the target the prescription moved to 6.
    expect(freestyleSeed(st, { id: BENCH }).repsMin).toBe(6)
    expect(freestyleSeed(st, { id: BENCH }).reps).toBe(8)
    train(st, second, 7, 62.5)
    const third = add(st)
    expect(third.plan.kind).not.toBe('first')
    expect(third.plan.why[0]).not.toMatch(/Plan changed/)
    expect(work(third).every(s => s.w === 62.5)).toBe(true)
    train(st, third, 8, 62.5)
    expect(work(add(st)).map(s => [s.w, s.r])).toEqual([[65, 6], [65, 6]])
  })

  it('an exercise\'s own rule progresses it with the setting off', () => {
    const st = state()
    train(st, add(st, { sets: 2, reps: 8, repsMin: 6, weight: 60, prog: 'double' }), 8, 60)
    const next = add(st)
    expect(next.plan.policy).toBe('double')
    expect(work(next).map(s => s.w)).toEqual([62.5, 62.5])
  })

  it('an exercise set to no progression repeats last time under a freestyle rule', () => {
    const st = state({ freestyleProg: 'double' })
    train(st, add(st, { sets: 2, reps: 8, weight: 60, prog: 'off' }), 8, 60)
    const next = add(st)
    expect(next.plan).toBeNull()
    expect(work(next).map(s => s.w)).toEqual([60, 60])
  })
})
