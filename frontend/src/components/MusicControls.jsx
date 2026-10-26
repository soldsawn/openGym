import { useEffect, useState } from 'react'
import { t } from '../lib/i18n.js'
import { musicPlaying, sendMediaKey } from '../lib/media-keys.js'
import Icon from './Icon.jsx'

// How often the play/pause button asks whether music is playing, and how long after a tap: the
// player takes a moment to start or stop.
const POLL_MS = 3000
const AFTER_TAP_MS = 600

// Previous, play/pause and next for the phone's music, in one slim row under the workout header
// (fork). The app that last played takes the keys (lib/media-keys.js), so skipping a song no
// longer means leaving the workout.
export default function MusicControls() {
  const [playing, setPlaying] = useState(null)
  useEffect(() => {
    let gone = false
    const read = () => musicPlaying().then(p => { if (!gone) setPlaying(p) })
    read()
    const id = setInterval(read, POLL_MS)
    return () => { gone = true; clearInterval(id) }
  }, [])
  const press = key => {
    if (key === 'toggle' && playing != null) setPlaying(!playing)
    sendMediaKey(key).then(() => setTimeout(() => musicPlaying().then(p => { if (p != null) setPlaying(p) }), AFTER_TAP_MS))
  }
  return <div className="wmusic" role="group" aria-label={t('Music')}>
    <button type="button" className="iconbtn" aria-label={t('Previous track')} onClick={() => press('previous')}><Icon name="skipBack" /></button>
    <button type="button" className="iconbtn" aria-label={playing ? t('Pause music') : t('Play music')} onClick={() => press('toggle')}>
      <Icon name={playing ? 'pause' : 'play'} />
    </button>
    <button type="button" className="iconbtn" aria-label={t('Next track')} onClick={() => press('next')}><Icon name="skipForward" /></button>
  </div>
}
