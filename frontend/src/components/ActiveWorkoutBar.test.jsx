// @vitest-environment happy-dom
// The workout you stepped away from, above the tab bar: its name and time, Resume, and ✕ to
// discard it behind the same question the workout screen asks.
import React, { act } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DEF, useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import ActiveWorkoutBar, { runningElsewhere } from './ActiveWorkoutBar.jsx'

const clone = v => JSON.parse(JSON.stringify(v))
const mounted = []
function mount(path = '/home') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  mounted.push(root)
  act(() => root.render(
    <MemoryRouter initialEntries={[path]}>
      <ActiveWorkoutBar />
      <Routes>
        <Route path="/workout" element={<div className="on-workout" />} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>))
  return host
}
function mountTopSheet() {
  const sheet = useUI.getState().sheets.at(-1)
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  mounted.push(root)
  act(() => root.render(sheet.render(() => useUI.getState().closeSheet(sheet.id))))
  return host
}
const button = (host, text) => [...host.querySelectorAll('button')].find(b => b.textContent.trim() === text)

function install(active) {
  const S = clone(DEF)
  Object.assign(S, { unit: 'kg', active })
  useStore.setState({ S, user: { uid: 'u1' } })
}
const live = (extra = {}) => ({ id: 'w1', name: 'Push Day', start: Date.now() - 125000, cur: 0, entries: [], ...extra })

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  useUI.setState({ sheets: [] })
  document.body.innerHTML = ''
  document.body.className = ''
  localStorage.clear()
  install(live())
})
afterEach(() => { act(() => { mounted.splice(0).forEach(root => root.unmount()) }) })

describe('the running workout above the tab bar', () => {
  it('shows the workout\'s name and running time on another screen, and keeps the page clear of it', () => {
    const host = mount('/home')
    const bar = host.querySelector('#wobar')
    expect(bar.querySelector('.wobar-name').textContent).toBe('Push Day')
    expect(bar.querySelector('.wobar-time').textContent).toMatch(/^2:0\d$/)
    expect(button(host, 'Resume')).toBeTruthy()
    expect(document.body.classList.contains('wobar')).toBe(true)
  })

  it('is not there on the workout screen, for a past workout, an edit, or no workout at all', () => {
    expect(runningElsewhere(live(), 'workout')).toBe(false)
    expect(runningElsewhere(live({ backfill: true }), 'home')).toBe(false)
    expect(runningElsewhere(live({ editingWorkoutId: 'w0' }), 'home')).toBe(false)
    expect(runningElsewhere(live({ start: 0 }), 'home')).toBe(false)
    expect(runningElsewhere(null, 'home')).toBe(false)
    expect(runningElsewhere(live(), 'stats')).toBe(true)
    install(null)
    expect(mount('/home').querySelector('#wobar')).toBeNull()
    expect(document.body.classList.contains('wobar')).toBe(false)
  })

  it('is switched off from Settings, and back on', () => {
    useStore.getState().update(s => { s.workoutBar = false })
    expect(mount('/home').querySelector('#wobar')).toBeNull()
    expect(document.body.classList.contains('wobar')).toBe(false)
    act(() => { useStore.getState().update(s => { s.workoutBar = true }) })
    expect(document.querySelector('#wobar')).toBeTruthy()
  })

  it('falls back to "Workout" for a session with no name', () => {
    install(live({ name: '' }))
    expect(mount('/plan').querySelector('.wobar-name').textContent).toBe('Workout')
  })

  it('goes back to the workout from Resume or from its name', () => {
    const host = mount('/stats')
    act(() => { button(host, 'Resume').click() })
    expect(host.querySelector('.on-workout')).toBeTruthy()
  })

  it('asks before discarding, then ends the session and lets a waiting Coach suggestion for it go', () => {
    const host = mount('/home')
    act(() => { host.querySelector('button[aria-label="Discard workout"]').click() })
    expect(useStore.getState().S.active).not.toBeNull()
    const ask = mountTopSheet()
    expect(ask.querySelector('h3').textContent).toBe('Discard workout?')
    act(() => { button(ask, 'Discard').click() })
    expect(useStore.getState().S.active).toBeNull()
    expect(JSON.parse(localStorage.getItem('og_coach_discarded'))).toEqual(['w1'])
  })

  it('keeps the workout when the question is cancelled', () => {
    const host = mount('/home')
    act(() => { host.querySelector('button[aria-label="Discard workout"]').click() })
    const ask = mountTopSheet()
    act(() => { button(ask, 'Cancel').click() })
    expect(useStore.getState().S.active?.id).toBe('w1')
  })
})
