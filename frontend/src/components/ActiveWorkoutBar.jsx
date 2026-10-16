// The workout you stepped away from, above the tab bar on every other screen: ✕ to discard it,
// its name and running time, and Resume to go back to it. A card like the rest timer's, so the
// two read as one family and the tab bar's raised Start button stays clear underneath; when a
// rest is running its bar moves up above this one (index.css body.wobar).
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { t } from '../lib/i18n.js'
import { confirmSheet } from '../sheets.jsx'
import { rememberDiscardedWorkout } from './WorkoutCoachSheet.jsx'
import Elapsed from './Elapsed.jsx'
import Icon from './Icon.jsx'
import { Button } from './ui.jsx'

/**
 * A live session running while you are on another screen: what the tab bar's Start shows a clock
 * for and this bar appears for. A past workout being edited or logged after the fact has no clock.
 */
export const runningElsewhere = (active, cur) => !!active && cur !== 'workout' && !active.editingWorkoutId && !active.backfill && active.start > 0

/**
 * Ends the session without saving it, from the workout screen's menu or this bar's ✕. A running
 * rest or timed set goes with it, and a Coach suggestion still waiting for that workout is known
 * to be over (WorkoutCoachSheet).
 */
export function discardActiveWorkout() {
  const id = useStore.getState().S.active?.id
  if (id) rememberDiscardedWorkout(id)
  useStore.getState().update(s => { s.active = null })
  useUI.getState().stopRest()
  useUI.getState().stopWork()
}

/** The same question either way: logged sets are lost, so it is asked first. `onDone` runs after. */
export const askDiscardWorkout = onDone => confirmSheet({
  title: t('Discard workout?'), message: t('The sets you logged in this session will be lost.'), confirmText: t('Discard'), danger: true,
  onConfirm: () => { discardActiveWorkout(); if (onDone) onDone() },
})

export default function ActiveWorkoutBar() {
  const nav = useNavigate()
  const loc = useLocation()
  const active = useStore(s => s.S.active)
  // Where the tab bar is: signed in, or a guest (TabBar).
  const signedIn = useStore(s => !!s.user || s.isGuest())
  // Settings → Before and during switches it off; the tab bar's Start still shows the time then.
  const wanted = useStore(s => s.S.workoutBar !== false)
  const shown = signedIn && wanted && runningElsewhere(active, loc.pathname.split('/')[1] || 'home')
  // The page keeps room at its bottom for the bar, as it does for the rest timer's.
  useEffect(() => {
    document.body.classList.toggle('wobar', shown)
    return () => document.body.classList.remove('wobar')
  }, [shown])
  if (!shown) return null
  const resume = () => nav('/workout')
  return (
    <div id="wobar" role="region" aria-label={t('Workout in progress')}>
      <button className="iconbtn" aria-label={t('Discard workout')} title={t('Discard workout')} onClick={() => askDiscardWorkout()}><Icon name="xmark" /></button>
      <button className="wobar-mid" onClick={resume}>
        <span className="wobar-name">{active.name || t('Workout')}</span>
        <span className="wobar-time"><Elapsed start={active.start} /></span>
      </button>
      <Button variant="primary" size="sm" className="wobar-go" onClick={resume}>{t('Resume')}</Button>
    </div>
  )
}
