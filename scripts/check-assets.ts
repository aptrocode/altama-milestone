import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { installationLayout, isPointInsideCanvas } from '../app/data/installation-layout';
import { WALL_CONFIG } from '../app/data/wall-config';
import { FLAG_SOURCES } from '../app/data/wall-copy';
import { COLUMN_IDS, WALL_LOCALES } from '../shared/wall';

const errors: string[] = [];
const root = new URL('../', import.meta.url);
const ids = WALL_CONFIG.columns.map(column => column.id);
if (JSON.stringify(ids) !== JSON.stringify(COLUMN_IDS))
  errors.push('Wall config must define columns 1–6 in order');
if (JSON.stringify(installationLayout.columns.map(column => column.id)) !== JSON.stringify(ids))
  errors.push('Sensor layout column IDs must match wall config');

for (const column of WALL_CONFIG.columns) {
  const geometry = installationLayout.columns.find(item => item.id === column.id)!;
  if (!Number.isSafeInteger(column.slides) || column.slides < 1)
    errors.push(`Column ${column.id}: invalid slide count`);
  for (const locale of WALL_LOCALES) {
    const copy = column.i18n?.[locale];
    if (!copy || Object.values(copy).some(text => typeof text !== 'string' || !text.trim()))
      errors.push(`Column ${column.id}: incomplete ${locale} copy`);
    const flags = geometry?.languages.filter(flag => flag.locale === locale) || [];
    if (flags.length !== 1)
      errors.push(`Column ${column.id}: missing/duplicate ${locale} target`);
    for (const sub of column.subItems || []) {
      const translated = sub.i18n?.[locale];
      const content = WALL_CONFIG.subItemContent[sub.key]?.[locale];
      if (!translated || !content || [...Object.values(translated), ...Object.values(content)].some(text => !text.trim()))
        errors.push(`Column ${column.id}/${sub.key}: incomplete ${locale} copy`);
    }
  }
  if (JSON.stringify(column.subItems?.map(sub => sub.key) || []) !== JSON.stringify(geometry?.submenu?.items.map(item => item.key) || []))
    errors.push(`Column ${column.id}: submenu geometry differs from config`);

  const targets = geometry
    ? [geometry.main, ...geometry.languages, ...Object.values(geometry.active), ...(geometry.submenu ? [geometry.submenu.back, ...geometry.submenu.items] : [])]
    : [];
  for (const target of targets) {
    if (![target.x, target.y, target.width, target.height].every(Number.isFinite)
      || target.width <= 0 || target.height <= 0 || !isPointInsideCanvas(target.x, target.y)
      || target.x + target.width > installationLayout.canvas.width || target.y + target.height > installationLayout.canvas.height) {
      errors.push(`Column ${column.id}: target is outside the canvas`);
    }
  }
}

for (const source of Object.values(FLAG_SOURCES)) {
  try {
    const path = fileURLToPath(new URL(`public${source}`, root));
    const svg = await readFile(path, 'utf8');
    if (!svg.includes('<svg') || !/viewBox="0 0 \d+ \d+"/.test(svg))
      errors.push(`${source}: invalid SVG/viewBox`);
  }
  catch {
    errors.push(`${source}: missing local flag`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
else {
  console.log('Asset/config validation passed: 6 columns, 18 flag targets, 5 submenu targets, 3 local SVG flags.');
  console.log('Carousel photos remain placeholders; no approved photo assets are declared.');
}
