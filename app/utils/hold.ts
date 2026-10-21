export const HOLD_DURATION_MS = 1_000;
/** How long a finished hold border stays fully drawn (with its glow) before the button acts. */
export const HOLD_SETTLE_MS = 250;

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
    Promise.all(borders.map(animation => animation.finished)).then(() => {
      if (completing && !disposed)
        settle();
    }, () => {
      if (completing && !disposed)
        settle();
    });
  }

  /** Show the finished border (and its glow) for a moment, so visitors see it complete, then act. */
  function settle() {
    element.classList.add('hold-complete');
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
    element.classList.remove('hold-complete');
    element.classList.add('holding');
    delayTimer = setTimeout(() => {
      delayTimer = undefined;
      complete();
    }, options.durationMs ?? HOLD_DURATION_MS);
  }

  function cancelDelay() {
    if (completing)
      return;
    clearTimeout(delayTimer);
    delayTimer = undefined;
    element.classList.remove('holding');
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
    element.classList.remove('holding');
  }

  function finish() {
    completing = false;
    clearTimeout(settleTimer);
    settleTimer = undefined;
    cancel();
    clearTimeout(completionTimer);
    element.classList.add('hold-complete');
    completionTimer = setTimeout(() => element.classList.remove('hold-complete'), 400);
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
    element.classList.remove('hold-complete');
    pointerId = pointer.pointerId;
    heldPointers.add(pointerId);
    element.classList.add('holding');
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
    if ((event as MouseEvent).detail === 0) {
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
      options = next;
      if (!holdEnabled())
        cancel();
      if (!delayed())
        cancelDelay();
    },
    dispose() {
      disposed = true;
      clearTimeout(settleTimer);
      completing = false;
      cancel();
      cancelDelay();
      clearTimeout(completionTimer);
      element.classList.remove('hold-complete');
      Object.entries(listeners).forEach(([name, handler]) => element.removeEventListener(name, handler));
      windowTarget.removeEventListener('pointerup', release);
      windowTarget.removeEventListener('blur', cancel);
    },
  };
}
