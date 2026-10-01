import rawLayout from '../../shared/installation-layout.json';

export const installationLayout = rawLayout as {
  layoutVersion: string;
  canvas: { width: number; height: number };
};

export function isPointInsideCanvas(x: number, y: number): boolean {
  return x >= 0
    && y >= 0
    && x <= (installationLayout.canvas?.width || 2304)
    && y <= (installationLayout.canvas?.height || 1344);
}
