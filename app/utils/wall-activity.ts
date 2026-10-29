/**
 * Native presses keep a column awake. Scripted pointers (TouchDesigner) count only on an enabled
 * wall button: repeated passive contacts must not starve inactivity reset. A real text drag
 * reports its own activity when it scrolls, and a photo swipe dispatches its accepted action.
 */
export function isWallPointerActivity(event: Pick<PointerEvent, 'isTrusted' | 'target'>): boolean {
  if (event.isTrusted)
    return true;
  const target = event.target as Element | null;
  const button = target?.closest?.<HTMLButtonElement>('button[data-sensor-action]');
  return !!button && !button.disabled && button.getAttribute('aria-disabled') !== 'true';
}
