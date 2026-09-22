import type { Ref } from 'vue';
import { gsap } from 'gsap';

export type AnimationResult = 'completed' | 'cancelled';

export interface MilestoneAnimationController {
  reveal: () => Promise<AnimationResult>;
  hide: () => Promise<AnimationResult>;
  showIdle: () => void;
  cancel: () => void;
  dispose: () => void;
}

export function useMilestoneAnimation(root: Ref<HTMLElement | null>): MilestoneAnimationController {
  let context: gsap.Context | null = null;
  let timeline: ReturnType<typeof gsap.timeline> | null = null;
  let settleActive: ((result: AnimationResult) => void) | null = null;

  function ensureContext(): gsap.Context {
    if (!root.value)
      throw new Error('milestone animation root is not mounted');

    context ??= gsap.context(() => {}, root.value);
    return context;
  }

  function cancel() {
    timeline?.kill();
    timeline = null;
    settleActive?.('cancelled');
    settleActive = null;
  }

  function play(build: (activeTimeline: ReturnType<typeof gsap.timeline>) => void): Promise<AnimationResult> {
    cancel();

    return new Promise((resolve) => {
      settleActive = resolve;
      ensureContext().add(() => {
        timeline = gsap.timeline({
          onComplete: () => {
            timeline = null;
            settleActive?.('completed');
            settleActive = null;
          },
        });
        build(timeline);
      });
    });
  }

  function reveal() {
    return play((activeTimeline) => {
      activeTimeline
        .set('.artwork-slot[data-active="true"] .artwork-color', {
          clipPath: 'inset(100% 0% 0% 0%)',
        })
        .set('.story-copy', { opacity: 0.65 })
        .to('.artwork-slot[data-active="true"] .artwork-color', {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: 'power3.inOut',
        })
        .to('.story-copy', {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        }, 0.5);
    });
  }

  function hide() {
    return play((activeTimeline) => {
      activeTimeline
        .to('.story-copy', {
          opacity: 0.65,
          duration: 0.2,
          ease: 'power2.in',
        })
        .to('.artwork-slot[data-active="true"] .artwork-color', {
          clipPath: 'inset(100% 0% 0% 0%)',
          duration: 0.32,
          ease: 'power2.inOut',
        }, 0);
    });
  }

  function showIdle() {
    cancel();
    ensureContext().add(() => {
      gsap.set('.artwork-slot[data-active="true"] .artwork-color', {
        clipPath: 'inset(100% 0% 0% 0%)',
      });
      gsap.set('.story-copy', { opacity: 1 });
    });
  }

  function dispose() {
    cancel();
    context?.revert();
    context = null;
  }

  return { reveal, hide, showIdle, cancel, dispose };
}
