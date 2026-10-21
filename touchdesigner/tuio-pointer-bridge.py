import json
import math

# ==========================================================================
# TUIO -> POINTER BRIDGE V4 (Altama Interactive Wall)
# TouchDesigner 2025.32460, Execute DAT (onFrameStart)
#
# Replaces "TUIO MULTITOUCH V3.2". V3.2 only called element.click() when a
# touch was released, so the wall never saw a press: Hold could not be timed
# and every tap acted at once. V4 sends real pointer events for every TUIO
# touch (each TUIO id is its own pointer), like a multitouch screen:
#   touch down -> pointerdown   (Hold / Tap + delay start, border animates)
#   touch move -> pointermove   (text scroll, photo swipe)
#   touch up   -> pointerup (+ click when it ended on the same button)
# Several people can press, hold, and swipe at the same time.
#
# Wall side: see docs/dashboard.md (Hold) and PANDUAN-SENSOR.md.
# ==========================================================================

TUIO = '/project1/tuioin1'
WEB = '/project1/webBrowser/webrender1'
SETTINGS = '/project1/webBrowser/touch_settings'

FLIP_Y = False

# A touch that moves farther than this (normalised 0-1) from where it started
# is a drag (scroll/swipe), so its release does not click.
DRAG_THRESHOLD = 0.035
# Moves smaller than this (normalised) are not sent (LiDAR jitter).
MOVE_MIN_DELTA = 0.001


def onFrameStart(frame):

    dat = op(TUIO)
    web = op(WEB)

    if dat is None or web is None:
        return

    ch = op(SETTINGS)
    show = bool(float(ch['indicators'][0]) > 0.5) if ch else True

    previous = me.fetch('touch_states', {})
    current = {}
    events = []

    # ======================================
    # READ TUIO
    # ======================================

    for row in range(1, dat.numRows):

        tid = str(dat[row, 'id'].val)

        x = max(0.0, min(1.0, float(dat[row, 'u'].val)))
        y = max(0.0, min(1.0, float(dat[row, 'v'].val)))

        if FLIP_Y:
            y = 1.0 - y

        old = previous.get(tid)

        # TOUCH DOWN
        if old is None:
            current[tid] = dict(x=x, y=y, startX=x, startY=y, dragging=False)
            events.append(dict(type='down', id=tid, x=x, y=y))
            continue

        # TOUCH MOVE
        dragging = old['dragging'] or math.hypot(x - old['startX'], y - old['startY']) > DRAG_THRESHOLD
        current[tid] = dict(x=x, y=y, startX=old['startX'], startY=old['startY'], dragging=dragging)

        if max(abs(x - old['x']), abs(y - old['y'])) > MOVE_MIN_DELTA:
            events.append(dict(type='move', id=tid, x=x, y=y))

    # ======================================
    # TOUCH RELEASE
    # ======================================

    for tid, old in previous.items():
        if tid not in current:
            events.append(dict(type='up', id=tid, x=old['x'], y=old['y'], dragged=old['dragging']))

    # ======================================
    # PREPARE DATA
    # ======================================

    if not events and show == me.fetch('lastShow', None):
        return

    payload = dict(
        touches=[dict(id=tid, **state) for tid, state in current.items()],
        events=events,
        show=show,
    )

    # ======================================
    # WEB BROWSER JAVASCRIPT
    # ======================================

    js = r"""
(() => {

    const d = __PAYLOAD__;
    const prefix = 'td_tuio_marker_';
    // Pointers that are down: TUIO id -> { pointerId, target }.
    const down = window.__tdPointers || (window.__tdPointers = new Map());

    const p = t => ({
        x: Math.max(0, Math.min(innerWidth - 1, t.x * innerWidth)),
        y: Math.max(0, Math.min(innerHeight - 1, t.y * innerHeight))
    });

    // A stable number per TUIO id (pointer ids must be numbers).
    const pointerIdOf = id => {
        let h = 0;
        for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) | 0;
        return 1000 + (Math.abs(h) % 1000000);
    };

    function fire(el, type, pointerId, q) {
        if (!el) return;
        el.dispatchEvent(new PointerEvent(type, {
            pointerId,
            pointerType: 'touch',
            isPrimary: false,
            button: type === 'pointermove' ? -1 : 0,
            buttons: type === 'pointerup' ? 0 : 1,
            clientX: q.x,
            clientY: q.y,
            bubbles: true,
            cancelable: true,
            composed: true
        }));
    }

    // =====================================
    // POINTER EVENTS
    // =====================================

    for (const e of d.events) {

        const q = p(e);

        if (e.type === 'down') {
            const target = document.elementFromPoint(q.x, q.y);
            const pointerId = pointerIdOf(e.id);
            down.set(e.id, { pointerId, target });
            fire(target, 'pointerdown', pointerId, q);

        } else if (e.type === 'move') {
            // Like a real touch, moves go to the element the finger pressed (implicit capture).
            const s = down.get(e.id);
            if (s) fire(s.target, 'pointermove', s.pointerId, q);

        } else if (e.type === 'up') {
            const s = down.get(e.id);
            if (!s) continue;
            down.delete(e.id);
            fire(s.target, 'pointerup', s.pointerId, q);
            // A tap that ended on the button it pressed also clicks it (Tap mode).
            const pressed = s.target?.closest?.('button,a,[role="button"]');
            const released = document.elementFromPoint(q.x, q.y)?.closest?.('button,a,[role="button"]');
            if (!e.dragged && pressed && pressed === released) {
                pressed.dispatchEvent(new MouseEvent('click', {
                    bubbles: true, cancelable: true, detail: 1, clientX: q.x, clientY: q.y
                }));
            }
        }
    }

    // =====================================
    // MULTITOUCH INDICATORS
    // =====================================

    const ids = new Set();

    for (const t of d.touches) {

        const id = prefix + t.id;
        ids.add(id);

        let m = document.getElementById(id);

        if (!m) {
            m = document.createElement('div');
            m.id = id;
            m.setAttribute('data-td-tuiomarker', '1');
            Object.assign(m.style, {
                position: 'fixed', width: '36px', height: '36px', borderRadius: '50%',
                transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: '2147483647',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', font: 'bold 11px Arial', userSelect: 'none'
            });
            m.textContent = t.id;
            document.documentElement.appendChild(m);
        }

        const q = p(t);
        const color = t.dragging ? '#ffcc00' : '#00e5ff';
        m.style.left = q.x + 'px';
        m.style.top = q.y + 'px';
        m.style.border = '2px solid ' + color;
        m.style.background = t.dragging ? 'rgba(255,204,0,0.25)' : 'rgba(0,230,255,0.25)';
        m.style.boxShadow = '0 0 12px ' + color;
        m.style.display = d.show ? 'flex' : 'none';
    }

    // REMOVE INACTIVE INDICATORS
    document.querySelectorAll('[data-td-tuiomarker]').forEach(m => {
        if (!ids.has(m.id)) m.remove();
    });

})();
"""

    # ======================================
    # EXECUTE JAVASCRIPT
    # ======================================

    web.executeJavaScript(js.replace('__PAYLOAD__', json.dumps(payload)))

    # ======================================
    # SAVE STATE
    # ======================================

    me.store('touch_states', current)
    me.store('lastShow', show)

    return
