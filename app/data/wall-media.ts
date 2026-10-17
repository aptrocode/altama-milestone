import type { MediaAsset } from '~/types/wall-content';

/**
 * Full-stage background. `none` renders the coded gradient fallback; `image` and `video`
 * render a local file above it. Convert image sequences to a looping video unless alpha is required.
 */
export type BackgroundMedia
  = | { kind: 'none' }
    | ({ kind: 'image' } & MediaAsset)
    | ({ kind: 'video'; poster?: string } & MediaAsset);

export interface StageMedia {
  background: BackgroundMedia;
  /** Event logo in the header; null hides it, e.g. when the background video already contains it. */
  logo: MediaAsset | null;
  /** Skyline layer at the bottom; null hides it, e.g. when the background video already contains it. */
  skyline: MediaAsset | null;
  /** Animated light sweeps traced over the corner waves of the current background image; turn off when the image changes. */
  waveSweeps: boolean;
}

export const STAGE_MEDIA: StageMedia = {
  // Mockup 1 with its cards and logo filled in; it already contains the skyline.
  background: { kind: 'image', src: '/summit/background.webp', approved: false },
  logo: { src: '/summit/logo-powering-partnership.webp', approved: false },
  skyline: null,
  waveSweeps: true,
};
