export const HOLD_DURATION_MS = 1_000;

export interface HoldOptions {
  onActivate: () => void;
  /** false: any press activates immediately (operator dashboard "hold off"). Default true. */
  enabled?: boolean;
  /** Dwell before activation while enabled. Default HOLD_DURATION_MS. */
  durationMs?: number;
}

/**
 * Pointer contact must dwell while hold is enabled; native keyboard/assistive clicks always
 * activate immediately. Options can change at any time through `update` (dashboard edits).
 */
export function bindHold(element: HTMLElement, initial: HoldOptions) {
  let options = initial;
  let pointerId: number | null = null;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let completionTimer: ReturnType<typeof setTimeout> | undefined;
  const windowTarget = element.ownerDocument.defaultView!;
  const holdEnabled = () => options.enabled !== false;

  function cancel() {
    clearTimeout(holdTimer);
    holdTimer = undefined;
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
    if (!holdEnabled() || pointer.button !== 0 || pointer.isPrimary === false || pointerId !== null)
      return;
    clearTimeout(completionTimer);
    element.classList.remove('hold-complete');
    pointerId = pointer.pointerId;
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
    // Keyboard/assistive clicks (detail 0) always activate; pointer clicks only when hold is off.
    if ((event as MouseEvent).detail === 0 || !holdEnabled())
      finish();
  }

  function keydown(event: Event) {
    const key = event as KeyboardEvent;
    if (key.repeat && (key.key === 'Enter' || key.key === ' '))
      key.preventDefault();
  }

  const listeners: Record<string, EventListener> = {
    pointerdown: start,
    pointerleave: release,
    pointercancel: release,
    click,
    keydown,
  };
  Object.entries(listeners).forEach(([name, handler]) => element.addEventListener(name, handler));
  windowTarget.addEventListener('pointerup', release);
  windowTarget.addEventListener('blur', cancel);

  return {
    update(next: HoldOptions) {
      options = next;
      if (!holdEnabled())
        cancel();
    },
    dispose() {
      cancel();
      clearTimeout(completionTimer);
      element.classList.remove('hold-complete');
      Object.entries(listeners).forEach(([name, handler]) => element.removeEventListener(name, handler));
      windowTarget.removeEventListener('pointerup', release);
      windowTarget.removeEventListener('blur', cancel);
    },
  };
}
