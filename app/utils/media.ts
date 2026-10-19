/** Local video files play in a <video> element; everything else is an image. */
export function isVideoSrc(src?: string | null): boolean {
  return !!src && /\.(?:mp4|webm|ogg)$/i.test(src);
}
