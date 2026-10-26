package ch.duartesantos.opengym;

import android.content.Context;
import android.media.AudioManager;
import android.os.SystemClock;
import android.view.KeyEvent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Previous, play/pause and next for whatever music the phone is playing (YouTube Music, Spotify...)
 * from the workout screen, without switching apps. The same media key a headset button sends: the
 * system hands it to the app that last played, so no permission is needed. Whether music is playing
 * is AudioManager.isMusicActive(); the track itself would need notification access, so it is left out.
 *
 * Usage from JS (lib/media-keys.js):
 *   registerPlugin('MediaKeys').send({ key: 'previous' | 'toggle' | 'next' })
 *   registerPlugin('MediaKeys').state()   // { playing }
 */
@CapacitorPlugin(name = "MediaKeys")
public class MediaKeysPlugin extends Plugin {

    static int keyCodeOf(String key) {
        if ("previous".equals(key)) return KeyEvent.KEYCODE_MEDIA_PREVIOUS;
        if ("next".equals(key)) return KeyEvent.KEYCODE_MEDIA_NEXT;
        if ("toggle".equals(key)) return KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE;
        return -1;
    }

    private AudioManager audio() {
        return (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
    }

    @PluginMethod
    public void send(PluginCall call) {
        int code = keyCodeOf(call.getString("key", ""));
        AudioManager am = audio();
        if (code < 0 || am == null) {
            call.reject("unknown key");
            return;
        }
        long now = SystemClock.uptimeMillis();
        am.dispatchMediaKeyEvent(new KeyEvent(now, now, KeyEvent.ACTION_DOWN, code, 0));
        am.dispatchMediaKeyEvent(new KeyEvent(now, now, KeyEvent.ACTION_UP, code, 0));
        call.resolve();
    }

    @PluginMethod
    public void state(PluginCall call) {
        AudioManager am = audio();
        JSObject ret = new JSObject();
        ret.put("playing", am != null && am.isMusicActive());
        call.resolve(ret);
    }
}
