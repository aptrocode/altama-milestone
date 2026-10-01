import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindHold } from '../app/utils/hold';

class Button extends EventTarget {
  view = new EventTarget();
  ownerDocument = { defaultView: this.view };
  classes = new Set<string>();
  classList = {
    add: (name: string) => this.classes.add(name),
    remove: (name: string) => this.classes.delete(name),
  };
}

function event(type: string, properties: Record<string, unknown>) {
  return Object.assign(new Event(type, { cancelable: true }), properties);
}

const bindings: ReturnType<typeof bindHold>[] = [];
function setup() {
  const button = new Button();
  const activate = vi.fn();
  const binding = bindHold(button as unknown as HTMLElement, activate);
  bindings.push(binding);
  return { button, activate, binding };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  bindings.splice(0).forEach(binding => binding.dispose());
  vi.useRealTimers();
});

describe('hold input lifecycle', () => {
  it('requires one second of primary pointer contact and does not fire again on its click', () => {
    const { button, activate } = setup();
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    vi.advanceTimersByTime(999);
    expect(activate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(activate).toHaveBeenCalledTimes(1);
    button.view.dispatchEvent(event('pointerup', { pointerId: 1 }));
    button.dispatchEvent(event('click', { detail: 1 }));
    expect(activate).toHaveBeenCalledTimes(1);
  });

  it.each(['pointerleave', 'pointercancel', 'blur', 'pointerup'])('cancels incomplete contact on %s', (type) => {
    const { button, activate } = setup();
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    const target = type === 'blur' || type === 'pointerup' ? button.view : button;
    target.dispatchEvent(event(type, { pointerId: 1 }));
    vi.advanceTimersByTime(1500);
    expect(activate).not.toHaveBeenCalled();
    expect(button.classes.has('holding')).toBe(false);
  });

  it('activates native keyboard/assistive clicks and uses the updated callback', () => {
    const { button, activate, binding } = setup();
    button.dispatchEvent(event('click', { detail: 0 }));
    expect(activate).toHaveBeenCalledTimes(1);
    const updated = vi.fn();
    binding.update(updated);
    button.dispatchEvent(event('click', { detail: 0 }));
    expect(updated).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenCalledTimes(1);
  });

  it('ignores secondary mouse buttons and non-primary contacts', () => {
    const { button, activate } = setup();
    button.dispatchEvent(event('pointerdown', { button: 2, pointerId: 1, isPrimary: true }));
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 2, isPrimary: false }));
    vi.advanceTimersByTime(2000);
    expect(activate).not.toHaveBeenCalled();
  });

  it('removes all listeners and timers during disposal', () => {
    const { button, activate, binding } = setup();
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    binding.dispose();
    vi.advanceTimersByTime(2000);
    button.dispatchEvent(event('click', { detail: 0 }));
    expect(activate).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(button.classes.size).toBe(0);
  });
});
