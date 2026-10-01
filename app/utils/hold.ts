export const HOLD_DURATION_MS = 1_000;

/** Pointer contact must dwell; native keyboard/assistive clicks activate immediately. */
export function bindHold(element: HTMLElement, activate: () => void) {
  let callback = activate;
  let pointerId: number | null = null;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let completionTimer: ReturnType<typeof setTimeout> | undefined;
  const windowTarget = element.ownerDocument.defaultView!;

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
    callback();
  }

  function start(event: Event) {
    const pointer = event as PointerEvent;
    if (pointer.button !== 0 || pointer.isPrimary === false || pointerId !== null)
      return;
    clearTimeout(completionTimer);
    element.classList.remove('hold-complete');
    pointerId = pointer.pointerId;
    element.classList.add('holding');
    holdTimer = setTimeout(finish, HOLD_DURATION_MS);
  }

  function release(event: Event) {
    if ((event as PointerEvent).pointerId === pointerId)
      cancel();
  }

  function click(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if ((event as MouseEvent).detail === 0)
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
    update(next: () => void) { callback = next; },
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
