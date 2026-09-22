import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import milestones from '../shared/milestones.json';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, '..');
const force = process.argv.includes('--force');
let created = 0;

for (const milestone of milestones) {
  if (milestone.contentStatus !== 'placeholder')
    continue;

  const directory = path.join(root, 'public/milestones', milestone.section, milestone.id);
  await mkdir(directory, { recursive: true });
  const color = path.join(directory, 'color.webp');
  const sketch = path.join(directory, 'sketch.webp');
  const exists = await stat(color).then(() => true, () => false);
  if (!exists || force) {
    await sharp(path.join(root, 'scripts/fixtures', `${milestone.section}.png`))
      .resize(milestone.artworkWidth, milestone.artworkHeight, { fit: 'fill' })
      .webp({ quality: 92 })
      .toFile(color);
    created++;
  }
  // Reference previews reuse one image; CSS desaturates the sketch layer so registration is exact.
  // Replace BOTH files with the artist's aligned sketch/color pair for approved milestones.
  if (force || !await stat(sketch).then(() => true, () => false)) {
    await copyFile(color, sketch);
    created++;
  }
}

console.log(`Generated ${created} fixture asset(s). Approved catalog entries were preserved.`);
