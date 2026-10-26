// Previous, play/pause and next for the phone's music from the workout screen (fork), through the
// native MediaKeys plugin (android/.../MediaKeysPlugin.java): the media key a headset button sends,
// which the system hands to the app that last played. Android app only: iOS lets no app steer
// another one's player, and a web page cannot either.
import { MOBILE } from './mobile.js'

export const MEDIA_KEYS = MOBILE && typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent)

// Registered once, and handed out inside an object: a Capacitor plugin proxy answers `then` with
// a native call that never settles, so a promise resolved with the bare proxy hangs (#42).
let pluginP = null
const keysPlugin = () => pluginP || (pluginP = (async () => {
  if (!MEDIA_KEYS) return null
  const { registerPlugin } = await import('@capacitor/core')
  return { MediaKeys: registerPlugin('MediaKeys') }
})().catch(() => null))

/** Sends 'previous', 'toggle' or 'next'. Never throws; false when nothing was sent. */
export async function sendMediaKey(key) {
  const p = await keysPlugin()
  if (!p) return false
  try { await p.MediaKeys.send({ key }); return true } catch { return false }
}

/** Is music playing right now? null when the phone cannot say. */
export async function musicPlaying() {
  const p = await keysPlugin()
  if (!p) return null
  try { return !!(await p.MediaKeys.state()).playing } catch { return null }
}
