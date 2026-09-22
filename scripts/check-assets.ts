import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';
import milestones from '../shared/milestones.json';

const root = path.resolve(import.meta.dir, '..');
const assetRoot = path.join(root, 'public', 'milestones');
const errors: string[] = [];
const warnings: string[] = [];
const knownDirectories = new Set<string>();
const ids = new Set<string>();

async function inspectImage(filePath: string) {
  try {
    const metadata = await sharp(filePath).metadata();
    return metadata;
  }
  catch (error) {
    errors.push(`${path.relative(root, filePath)} cannot be read: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

for (const milestone of milestones) {
  if (ids.has(milestone.id))
    errors.push(`Duplicate milestone id: ${milestone.id}`);
  ids.add(milestone.id);

  if (!milestone.id.startsWith(`${milestone.section}-`))
    errors.push(`${milestone.id} must start with ${milestone.section}-`);

  const directory = path.join(assetRoot, milestone.section, milestone.id);
  knownDirectories.add(path.normalize(directory).toLowerCase());
  const sketchPath = path.join(directory, 'sketch.webp');
  const colorPath = path.join(directory, 'color.webp');
  const [sketch, color] = await Promise.all([inspectImage(sketchPath), inspectImage(colorPath)]);

  if (!sketch || !color)
    continue;

  for (const [variant, metadata] of [['sketch', sketch], ['color', color]] as const) {
    if (metadata.format !== 'webp')
      errors.push(`${milestone.id}/${variant}.webp is ${metadata.format ?? 'unknown'}, expected WebP`);
    if ((metadata.pages ?? 1) !== 1)
      errors.push(`${milestone.id}/${variant}.webp must be a static image`);
  }

  if (sketch.width !== color.width || sketch.height !== color.height)
    errors.push(`${milestone.id} sketch/color dimensions do not match`);

  if (sketch.width !== milestone.artworkWidth || sketch.height !== milestone.artworkHeight)
    errors.push(`${milestone.id} is ${sketch.width}x${sketch.height}, expected ${milestone.artworkWidth}x${milestone.artworkHeight}`);

  console.log(`✓ ${milestone.id} ${sketch.width}x${sketch.height}`);
}

try {
  for (const sectionEntry of await readdir(assetRoot, { withFileTypes: true })) {
    if (!sectionEntry.isDirectory())
      continue;
    const sectionPath = path.join(assetRoot, sectionEntry.name);
    for (const milestoneEntry of await readdir(sectionPath, { withFileTypes: true })) {
      if (!milestoneEntry.isDirectory())
        continue;
      const directory = path.normalize(path.join(sectionPath, milestoneEntry.name)).toLowerCase();
      if (!knownDirectories.has(directory))
        warnings.push(`Unreferenced asset directory: ${path.relative(root, directory)}`);
    }
  }
}
catch (error) {
  const exists = await stat(assetRoot).then(() => true, () => false);
  if (!exists)
    errors.push('public/milestones does not exist');
  else
    errors.push(error instanceof Error ? error.message : String(error));
}

for (const warning of warnings)
  console.warn(`WARN: ${warning}`);

if (errors.length > 0) {
  for (const error of errors)
    console.error(`ERROR: ${error}`);
  process.exitCode = 1;
}
else {
  console.log(`Asset validation passed (${milestones.length} milestones).`);
}
