import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindHold } from '../app/utils/hold';

class Button extends EventTarget {
  ownerDocument: { defaultView: EventTarget };
  classes = new Set<string>();
  constructor(public view = new EventTarget()) {
    super();
    this.ownerDocument = { defaultView: view };
  }

  classList = {
    add: (name: string) => this.classes.add(name),
    remove: (name: string) => this.classes.delete(name),
  };
}

function event(type: string, properties: Record<string, unknown>) {
  return Object.assign(new Event(type, { cancelable: true }), properties);
}

const bindings: ReturnType<typeof bindHold>[] = [];
function setup(options: { enabled?: boolean; durationMs?: number; mode?: 'tap' | 'hold' | 'delay' } = {}, view?: EventTarget) {
  const button = new Button(view);
  const activate = vi.fn();
  const binding = bindHold(button as unknown as HTMLElement, { onActivate: activate, ...options });
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
    binding.update({ onActivate: updated });
    button.dispatchEvent(event('click', { detail: 0 }));
    expect(updated).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenCalledTimes(1);
  });

  it('uses the configured dwell time', () => {
    const { button, activate } = setup({ durationMs: 2500 });
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    vi.advanceTimersByTime(2499);
    expect(activate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(activate).toHaveBeenCalledTimes(1);
  });

  it('activates on a normal press when hold is turned off, and cancels a running hold', () => {
    const { button, activate, binding } = setup({ enabled: false });
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    expect(button.classes.has('holding')).toBe(false);
    button.dispatchEvent(event('click', { detail: 1 }));
    expect(activate).toHaveBeenCalledTimes(1);

    binding.update({ onActivate: activate, enabled: true });
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 2, isPrimary: true }));
    binding.update({ onActivate: activate, enabled: false });
    vi.advanceTimersByTime(2000);
    expect(activate).toHaveBeenCalledTimes(1);
    expect(button.classes.has('holding')).toBe(false);
  });

  it('ignores secondary mouse buttons', () => {
    const { button, activate } = setup();
    button.dispatchEvent(event('pointerdown', { button: 2, pointerId: 1, isPrimary: true }));
    vi.advanceTimersByTime(2000);
    expect(activate).not.toHaveBeenCalled();
  });

  it('holds different buttons with simultaneous touches', () => {
    const view = new EventTarget();
    const first = setup({}, view);
    const second = setup({}, view);
    first.button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    vi.advanceTimersByTime(400);
    second.button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 2, isPrimary: false }));
    expect(second.button.classes.has('holding')).toBe(true);
    vi.advanceTimersByTime(600);
    expect(first.activate).toHaveBeenCalledTimes(1);
    expect(second.activate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(second.activate).toHaveBeenCalledTimes(1);
  });

  it('releases each touch independently', () => {
    const view = new EventTarget();
    const first = setup({}, view);
    const second = setup({}, view);
    first.button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    second.button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 2, isPrimary: false }));
    view.dispatchEvent(event('pointerup', { pointerId: 1 }));
    vi.advanceTimersByTime(1000);
    expect(first.activate).not.toHaveBeenCalled();
    expect(first.button.classes.has('holding')).toBe(false);
    expect(second.activate).toHaveBeenCalledTimes(1);
  });

  it('ignores a second touch on a held button without restarting it', () => {
    const { button, activate } = setup();
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    vi.advanceTimersByTime(600);
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 2, isPrimary: false }));
    button.view.dispatchEvent(event('pointerup', { pointerId: 2 }));
    vi.advanceTimersByTime(400);
    expect(activate).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2000);
    expect(activate).toHaveBeenCalledTimes(1);
  });

  it('lets one touch drive only one button at a time', () => {
    const view = new EventTarget();
    const inner = setup({}, view);
    const outer = setup({}, view);
    const down = { button: 0, pointerId: 3, isPrimary: false };
    inner.button.dispatchEvent(event('pointerdown', down));
    outer.button.dispatchEvent(event('pointerdown', down));
    expect(outer.button.classes.has('holding')).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(inner.activate).toHaveBeenCalledTimes(1);
    expect(outer.activate).not.toHaveBeenCalled();
    outer.button.dispatchEvent(event('pointerdown', down));
    vi.advanceTimersByTime(1000);
    expect(outer.activate).toHaveBeenCalledTimes(1);
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

  it('delay mode: a tap starts the hold animation and activates after the duration without holding', () => {
    const { button, activate } = setup({ enabled: false, mode: 'delay', durationMs: 800 });
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    button.view.dispatchEvent(event('pointerup', { pointerId: 1 }));
    button.dispatchEvent(event('pointerleave', { pointerId: 1 }));
    button.dispatchEvent(event('click', { detail: 1 }));
    expect(button.classes.has('holding')).toBe(true);
    // A second tap while waiting does not start another countdown.
    vi.advanceTimersByTime(400);
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 2, isPrimary: true }));
    vi.advanceTimersByTime(399);
    expect(activate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(activate).toHaveBeenCalledTimes(1);
    expect(button.classes.has('holding')).toBe(false);
  });

  it('wall:press (sensor input) delays in delay mode and activates at once otherwise', () => {
    const delayed = setup({ enabled: false, mode: 'delay', durationMs: 500 });
    delayed.button.dispatchEvent(new Event('wall:press'));
    expect(delayed.activate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(delayed.activate).toHaveBeenCalledTimes(1);
    const tap = setup({ enabled: false, mode: 'tap' });
    tap.button.dispatchEvent(new Event('wall:press'));
    expect(tap.activate).toHaveBeenCalledTimes(1);
  });

  it('waits for a border animation that started late before activating, even if released meanwhile', async () => {
    const { button, activate } = setup({ mode: 'hold', durationMs: 1000 });
    let done!: () => void;
    const finished = new Promise<void>((resolve) => {
      done = resolve;
    });
    (button as unknown as { getAnimations: () => unknown[] }).getAnimations = () => button.classes.has('holding')
      ? [{ animationName: 'hold-border-abc123', playState: 'running', finished }]
      : [];
    button.dispatchEvent(event('pointerdown', { button: 0, pointerId: 1, isPrimary: true }));
    vi.advanceTimersByTime(1000);
    // The duration passed but the border is still drawing: not yet, and a release does not cancel.
    expect(activate).not.toHaveBeenCalled();
    button.view.dispatchEvent(event('pointerup', { pointerId: 1 }));
    expect(button.classes.has('holding')).toBe(true);
    done();
    await finished;
    await Promise.resolve();
    expect(activate).toHaveBeenCalledTimes(1);
    expect(button.classes.has('hold-complete')).toBe(true);
  });
});
