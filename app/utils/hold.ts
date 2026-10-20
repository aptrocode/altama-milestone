export const HOLD_DURATION_MS = 1_000;

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

  function startDelay() {
    if (delayTimer !== undefined)
      return;
    clearTimeout(completionTimer);
    element.classList.remove('hold-complete');
    element.classList.add('holding');
    delayTimer = setTimeout(() => {
      delayTimer = undefined;
      finish();
    }, options.durationMs ?? HOLD_DURATION_MS);
  }

  function cancelDelay() {
    clearTimeout(delayTimer);
    delayTimer = undefined;
    element.classList.remove('holding');
  }

  /** A press from outside the pointer path (sensor input): delay mode animates first. */
  function press() {
    if (delayed())
      startDelay();
    else
      finish();
  }

  function cancel() {
    clearTimeout(holdTimer);
    holdTimer = undefined;
    if (pointerId !== null)
      heldPointers.delete(pointerId);
    pointerId = null;
    element.classList.remove('holding');
  }

  function finish() {
    cancel();
    clearTimeout(completionTimer);
    element.classList.add('hold-complete');
    completionTimer = setTimeout(() => element.classList.remove('hold-complete'), 400);
    options.onActivate();
  }

  function start(event: Event) {
    const pointer = event as PointerEvent;
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
    holdTimer = setTimeout(finish, options.durationMs ?? HOLD_DURATION_MS);
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
