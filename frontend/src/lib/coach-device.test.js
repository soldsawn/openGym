// The fork's own Coach limits from before 1.4.3 (`dailyCap`, `maxTokens`) carried into the
// `limits` dials upstream's Advanced section reads, once, when the device file is loaded.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const device = { data: null }
vi.mock('./mobile.js', () => ({
  MOBILE: true,
  readJsonFile: async () => device.data,
  writeJsonFile: async (_n, d) => { device.data = JSON.parse(JSON.stringify(d)) }
}))

const { fromForkLimits, loadCoachDevice, saveCoachDevice, coachLimits, _resetCoachDevice } = await import('./coach-device.js')

describe('fromForkLimits', () => {
  it('moves both old limits into limits and drops the old fields', () => {
    const out = fromForkLimits({ mode: 'byok', dailyCap: 80, maxTokens: 32000 })
    expect(out).toEqual({ mode: 'byok', limits: { daily: 80, maxOutputTokens: 32000 } })
  })

  it('clamps to the new ranges', () => {
    expect(fromForkLimits({ dailyCap: 500, maxTokens: 1000 }).limits).toEqual({ daily: 200, maxOutputTokens: 1024 })
  })

  it('an old limit never set (null) moves nothing', () => {
    expect(fromForkLimits({ mode: 'byok', dailyCap: null, maxTokens: null })).toEqual({ mode: 'byok' })
    expect(fromForkLimits({ dailyCap: null, maxTokens: 20000 }).limits).toEqual({ maxOutputTokens: 20000 })
  })

  it('a dial already in limits wins over the old field', () => {
    expect(fromForkLimits({ dailyCap: 80, limits: { daily: 5 } }).limits).toEqual({ daily: 5 })
  })

  it('leaves a file without the old fields as it is', () => {
    const d = { mode: 'off', limits: { daily: 3 } }
    expect(fromForkLimits(d)).toBe(d)
    expect(fromForkLimits(null)).toBe(null)
  })
})

describe('loading a pre-1.4.3 device file', () => {
  beforeEach(() => { _resetCoachDevice() })

  it('reads the old limits as dials, and the next save writes only the new shape', async () => {
    device.data = { mode: 'byok', provider: 'gemini', dailyCap: 60, maxTokens: 24000 }
    const d = await loadCoachDevice()
    expect(coachLimits(d)).toMatchObject({ daily: 60, maxOutputTokens: 24000 })
    await saveCoachDevice({ model: 'x' })
    expect(device.data).not.toHaveProperty('dailyCap')
    expect(device.data).not.toHaveProperty('maxTokens')
    expect(device.data.limits).toEqual({ daily: 60, maxOutputTokens: 24000 })
  })
})
