import { describe, expect, it } from 'vitest'
import { daysInMonth, fieldOrder, joinParts, monthNames, partsOf } from './date-wheel.js'

describe('the date wheel', () => {
  it('knows how long each month is, leap years included', () => {
    expect(daysInMonth(2026, 2)).toBe(28)
    expect(daysInMonth(2028, 2)).toBe(29)
    expect(daysInMonth(2026, 4)).toBe(30)
    expect(daysInMonth(2026, 10)).toBe(31)
  })

  it('splits a day and puts it back together', () => {
    expect(partsOf('2026-10-17')).toEqual({ y: 2026, m: 10, d: 17 })
    expect(joinParts({ y: 2026, m: 9, d: 5 })).toBe('2026-09-05')
  })

  it('cuts a day to the month it lands in, rather than rolling into the next', () => {
    expect(joinParts({ y: 2026, m: 4, d: 31 })).toBe('2026-04-30')
    expect(joinParts({ y: 2026, m: 2, d: 30 })).toBe('2026-02-28')
  })

  it('never lands past the last day allowed or before the first', () => {
    expect(joinParts({ y: 2026, m: 11, d: 3 }, { max: '2026-10-17' })).toBe('2026-10-17')
    expect(joinParts({ y: 2026, m: 10, d: 18 }, { max: '2026-10-17' })).toBe('2026-10-17')
    expect(joinParts({ y: 2016, m: 1, d: 1 }, { min: '2016-10-17' })).toBe('2016-10-17')
  })

  it('stands the wheels in the order the language writes a date', () => {
    expect(fieldOrder('tr-TR')).toEqual(['day', 'month', 'year'])
    expect(fieldOrder('en-US')).toEqual(['month', 'day', 'year'])
    expect(fieldOrder('zh-CN')[0]).toBe('year')
  })

  it('names the months in the language', () => {
    expect(monthNames('tr-TR')[9]).toBe('Ekim')
    expect(monthNames('en-GB')[0]).toBe('January')
  })
})
