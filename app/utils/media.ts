/** Local video files play in a <video> element; everything else is an image. */
export function isVideoSrc(src?: string | null): boolean {
  return !!src && /\.(?:mp4|webm|ogg)$/i.test(src);
}

/**
 * Capture a pointer when the browser allows it. Pointer events sent by a script (TouchDesigner's
 * TUIO bridge) have no active pointer, so capturing them throws; they work without it.
 */
export function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture?.(pointerId);
  }
  catch {}
}
