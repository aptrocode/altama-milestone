export const HOLD_DURATION_MS = 1_000;
/** How long a finished hold border stays fully drawn (with its glow) before the button acts. */
export const HOLD_SETTLE_MS = 250;
/** Longest wait for a late border animation after the duration before acting anyway. */
export const HOLD_STALL_MS = 1_000;

/** Pointers currently holding some button: one finger drives at most one button at a time. */
const heldPointers = new Set<number>();

export interface HoldOptions {
  onActivate: () => void;
  /** false: any press activates immediately (operator dashboard "hold off"). Default true. */
  enabled?: boolean;
  /**
   * 'delay': a press (pointer down, or the `wall:press` event from a sensor input) starts the hold
   * animation and activates after the duration without holding; releasing does not cancel.
   */
  mode?: 'tap' | 'hold' | 'delay';
  /** Dwell before activation while enabled. Default HOLD_DURATION_MS. */
  durationMs?: number;
}

/**
 * Pointer contact must dwell while hold is enabled. Every touch contact counts (native
 * multitouch), so different buttons hold independently; a button follows only the first
 * pointer that pressed it. Native keyboard/assistive clicks always activate immediately. Options can change at any time through `update` (dashboard edits).
 */
export function bindHold(element: HTMLElement, initial: HoldOptions) {
  let options = initial;
  let pointerId: number | null = null;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let completionTimer: ReturnType<typeof setTimeout> | undefined;
  const windowTarget = element.ownerDocument.defaultView!;
  const holdEnabled = () => options.enabled !== false;
  const delayed = () => options.mode === 'delay';
  let delayTimer: ReturnType<typeof setTimeout> | undefined;
  /** The duration has passed; activation waits only for the border animation to finish drawing. */
  let completing = false;
  let disposed = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let stallTimer: ReturnType<typeof setTimeout> | undefined;
  // The visual state classes this binding owns. Vue rewrites the button's whole class attribute
  // when a bound class changes (e.g. the idle touch hint moving on), which would drop them mid-hold;
  // `update()` (the directive's updated hook, after Vue's patch) puts them back.
  const shown = new Set<string>();
  function show(name: 'holding' | 'hold-complete', on: boolean) {
    if (on) {
      shown.add(name);
      element.classList.add(name);
    }
    else {
      shown.delete(name);
      element.classList.remove(name);
    }
  }

  /**
   * Activate once the border has visibly finished. The timer starts on the press, but the CSS
   * animation only starts at the next rendered frame, which a busy wall (videos, canvases) can
   * delay; without this the card would open with the border still unfinished.
   */
  function complete() {
    completing = true;
    const borders = (element.getAnimations?.({ subtree: true }) ?? [])
      .filter(animation => (animation as CSSAnimation).animationName?.includes('hold-border') && animation.playState === 'running');
    if (!borders.length) {
      settle();
      return;
    }
    let settled = false;
    const done = () => {
      clearTimeout(stallTimer);
      if (!settled && completing && !disposed) {
        settled = true;
        settle();
      }
    };
    // Safety: a border animation that never finishes (a hidden or frozen page) must not block the button.
    stallTimer = setTimeout(done, HOLD_STALL_MS);
    Promise.all(borders.map(animation => animation.finished)).then(done, done);
  }

  /** Show the finished border (and its glow) for a moment, so visitors see it complete, then act. */
  function settle() {
    show('hold-complete', true);
    settleTimer = setTimeout(() => {
      settleTimer = undefined;
      if (completing && !disposed)
        finish();
    }, HOLD_SETTLE_MS);
  }

  function startDelay() {
    if (delayTimer !== undefined)
      return;
    clearTimeout(completionTimer);
    show('hold-complete', false);
    show('holding', true);
    delayTimer = setTimeout(() => {
      delayTimer = undefined;
      complete();
    }, options.durationMs ?? HOLD_DURATION_MS);
  }

  function cancelDelay() {
    // Nothing to stop unless a delay runs: a Hold in progress keeps its border.
    if (completing || delayTimer === undefined)
      return;
    clearTimeout(delayTimer);
    delayTimer = undefined;
    show('holding', false);
  }

  /** A press from outside the pointer path (sensor input): delay mode animates first. */
  function press() {
    if (completing)
      return;
    if (delayed())
      startDelay();
    else
      finish();
  }

  function cancel() {
    // A completed hold is no longer cancelled by its release; it only waits for the border.
    if (completing)
      return;
    clearTimeout(holdTimer);
    holdTimer = undefined;
    if (pointerId !== null)
      heldPointers.delete(pointerId);
    pointerId = null;
    // A running Tap + delay keeps its border: only cancelDelay() (mode change, keyboard) stops it.
    if (delayTimer === undefined)
      show('holding', false);
  }

  function finish() {
    completing = false;
    clearTimeout(settleTimer);
    settleTimer = undefined;
    cancel();
    clearTimeout(completionTimer);
    show('hold-complete', true);
    completionTimer = setTimeout(show, 400, 'hold-complete', false);
    options.onActivate();
  }

  function start(event: Event) {
    const pointer = event as PointerEvent;
    if (completing)
      return;
    if (delayed()) {
      if (pointer.button === 0)
        startDelay();
      return;
    }
    if (!holdEnabled() || pointer.button !== 0 || pointerId !== null || heldPointers.has(pointer.pointerId))
      return;
    clearTimeout(completionTimer);
    show('hold-complete', false);
    pointerId = pointer.pointerId;
    heldPointers.add(pointerId);
    show('holding', true);
    holdTimer = setTimeout(complete, options.durationMs ?? HOLD_DURATION_MS);
  }

  function release(event: Event) {
    if ((event as PointerEvent).pointerId === pointerId)
      cancel();
  }

  function click(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    // Keyboard/assistive clicks (detail 0) always activate; pointer clicks only when hold is off
    // (delay mode already started on pointer down).
    if ((event as MouseEvent).detail === 0 && !event.isTrusted) {
      // A click sent by a script (TouchDesigner's `element.click()`) is a tap, not a keyboard
      // press: Tap + delay animates first. Hold cannot be timed from a click; that needs the
      // bridge to send pointerdown/pointerup (touchdesigner/tuio-pointer-bridge.py).
      press();
    }
    else if ((event as MouseEvent).detail === 0) {
      cancelDelay();
      finish();
    }
    else if (!holdEnabled() && !delayed()) {
      finish();
    }
  }

  function keydown(event: Event) {
    const key = event as KeyboardEvent;
    if (key.repeat && (key.key === 'Enter' || key.key === ' '))
      key.preventDefault();
  }

  const listeners: Record<string, EventListener> = {
    'pointerdown': start,
    'pointerleave': release,
    'pointercancel': release,
    click,
    keydown,
    'wall:press': press,
  };
  Object.entries(listeners).forEach(([name, handler]) => element.addEventListener(name, handler));
  windowTarget.addEventListener('pointerup', release);
  windowTarget.addEventListener('blur', cancel);

  return {
    update(next: HoldOptions) {
      // Vue calls this on every re-render of the button (e.g. the idle touch hint moving on), so
      // only a real mode change may stop what is running: Tap + delay reports enabled: false and
      // must keep its countdown and border.
      options = next;
      if (!holdEnabled() && !delayed())
        cancel();
      if (!delayed())
        cancelDelay();
      shown.forEach(name => element.classList.add(name));
    },
    dispose() {
      disposed = true;
      clearTimeout(settleTimer);
      clearTimeout(stallTimer);
      completing = false;
      cancel();
      cancelDelay();
      clearTimeout(completionTimer);
      show('hold-complete', false);
      Object.entries(listeners).forEach(([name, handler]) => element.removeEventListener(name, handler));
      windowTarget.removeEventListener('pointerup', release);
      windowTarget.removeEventListener('blur', cancel);
    },
  };
}
