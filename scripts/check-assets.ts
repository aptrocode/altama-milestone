import type { ContentBlock, ContentPage, MediaAsset } from '../app/types/wall-content';
import { access, readFile } from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { installationLayout, isPointInsideCanvas } from '../app/data/installation-layout';
import { WALL_CONFIG } from '../app/data/wall-config';
import { FLAG_SOURCES } from '../app/data/wall-copy';
import { STAGE_MEDIA } from '../app/data/wall-media';
import { MAX_PAGES } from '../shared/page-tabs';
import { COLUMN_IDS, WALL_LOCALES } from '../shared/wall';

const errors: string[] = [];
const root = new URL('../', import.meta.url);
const media: { owner: string; asset: MediaAsset }[] = [];
// Two layout tabs, or three derived ones (shared/page-tabs.ts).
const maxPageTabs = MAX_PAGES;
const ids = WALL_CONFIG.columns.map(column => column.id);
if (JSON.stringify(ids) !== JSON.stringify(COLUMN_IDS))
  errors.push('Wall config must define columns 1–6 in order');
if (JSON.stringify(installationLayout.columns.map(column => column.id)) !== JSON.stringify(ids))
  errors.push('Sensor layout column IDs must match wall config');

function blockTexts(block: ContentBlock): string[] {
  if (typeof block === 'string')
    return [block];
  if ('bullets' in block)
    return block.bullets.flatMap(item => [item.lead, ...(item.text === undefined ? [] : [item.text])]);
  return block.numbered;
}

function checkPages(owner: string, pages: ContentPage[] | undefined) {
  if (!pages?.length) {
    errors.push(`${owner}: needs at least one page`);
    return;
  }
  pages.forEach((page, index) => {
    page.photos.forEach((photo, slot) => {
      if (photo)
        media.push({ owner: `${owner} page ${index + 1} photo ${slot + 1}`, asset: photo });
    });
    for (const locale of WALL_LOCALES) {
      const copy = page.i18n[locale];
      copy?.blocks.forEach((block) => {
        if (typeof block === 'object' && 'bullets' in block) {
          block.bullets.forEach((item, bIndex) => {
            if (item.image)
              media.push({ owner: `${owner} page ${index + 1} bullet ${bIndex + 1} image`, asset: item.image });
            if (item.images) {
              item.images.forEach((img, imgIndex) => {
                media.push({ owner: `${owner} page ${index + 1} bullet ${bIndex + 1} image ${imgIndex + 1}`, asset: img });
              });
            }
          });
        }
      });
      const texts = copy?.blocks.flatMap(blockTexts) || [];
      if (!texts.length || texts.some(text => !text.trim()))
        errors.push(`${owner} page ${index + 1}: incomplete ${locale} copy`);
      if (pages.length > 1 && !copy?.tab?.trim())
        errors.push(`${owner} page ${index + 1}: paged content needs a ${locale} tab label`);
    }
  });
  if (pages.length > maxPageTabs)
    errors.push(`${owner}: ${pages.length} pages but only ${maxPageTabs} tab targets`);
}

for (const column of WALL_CONFIG.columns) {
  const owner = `Column ${column.id}`;
  const geometry = installationLayout.columns.find(item => item.id === column.id)!;
  for (const locale of WALL_LOCALES) {
    if (!column.i18n[locale]?.label.trim())
      errors.push(`${owner}: missing ${locale} label`);
    const flags = geometry?.languages.filter(flag => flag.locale === locale) || [];
    if (flags.length !== 1)
      errors.push(`${owner}: missing/duplicate ${locale} target`);
  }

  if (column.type === 'single') {
    if (!column.illustration)
      errors.push(`${owner}: single columns need an idle illustration`);
    else
      media.push({ owner: `${owner} illustration`, asset: column.illustration });
    if (!geometry?.main)
      errors.push(`${owner}: single columns need a main target`);
    checkPages(owner, column.pages);
  }
  else {
    if (!column.subItems?.length || !column.subItems.some(sub => sub.key === column.defaultSub))
      errors.push(`${owner}: expandable columns need sub-items including the default`);
    for (const sub of column.subItems || []) {
      const subOwner = `${owner}/${sub.key}`;
      for (const locale of WALL_LOCALES) {
        if (!sub.i18n[locale]?.label.trim())
          errors.push(`${subOwner}: missing ${locale} label`);
      }
      media.push({ owner: `${subOwner} image`, asset: sub.image });
      if (sub.wordmark)
        media.push({ owner: `${subOwner} wordmark`, asset: sub.wordmark });
      checkPages(subOwner, sub.pages);
    }
  }

  if (JSON.stringify(column.subItems?.map(sub => sub.key) || []) !== JSON.stringify(geometry?.subItems?.map(item => item.key) || []))
    errors.push(`${owner}: sub-item tile geometry differs from config`);

  // Idle targets stay inside the idle frame; open targets stay inside the column section.
  const idleTargets = geometry ? [...(geometry.main ? [geometry.main] : []), geometry.languageBar, ...geometry.languages, ...(geometry.subItems || [])] : [];
  const activeTargets = geometry ? [geometry.active.card, geometry.active.back, geometry.active.previous, geometry.active.next, ...geometry.active.pages] : [];
  const inside = (target: typeof idleTargets[number], box: typeof idleTargets[number]) => target.x >= box.x && target.y >= box.y
    && target.x + target.width <= box.x + box.width + 0.0001 && target.y + target.height <= box.y + box.height + 0.0001;
  for (const target of [...idleTargets, ...activeTargets]) {
    if (![target.x, target.y, target.width, target.height].every(Number.isFinite)
      || target.width <= 0 || target.height <= 0 || !isPointInsideCanvas(target.x, target.y)
      || target.x + target.width > installationLayout.canvas.width || target.y + target.height > installationLayout.canvas.height) {
      errors.push(`${owner}: target is outside the canvas`);
    }
  }
  if (geometry && idleTargets.some(target => !inside(target, geometry.card)))
    errors.push(`${owner}: idle target is outside its frame`);
  if (geometry && activeTargets.some(target => !inside(target, geometry.section)))
    errors.push(`${owner}: open target is outside its column`);
}

if (STAGE_MEDIA.logo)
  media.push({ owner: 'Stage logo', asset: STAGE_MEDIA.logo });
if (STAGE_MEDIA.skyline)
  media.push({ owner: 'Stage skyline', asset: STAGE_MEDIA.skyline });
if (STAGE_MEDIA.background.kind !== 'none') {
  media.push({ owner: 'Stage background', asset: STAGE_MEDIA.background });
  if (STAGE_MEDIA.background.kind === 'video' && STAGE_MEDIA.background.poster)
    media.push({ owner: 'Stage background poster', asset: { src: STAGE_MEDIA.background.poster, approved: STAGE_MEDIA.background.approved } });
}

const mediaPattern = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\.(?:webp|png|jpg|svg|mp4|webm)$/;
for (const { owner, asset } of media) {
  if (!mediaPattern.test(asset.src))
    errors.push(`${owner}: ${asset.src} must be a lowercase kebab-case local path`);
  try {
    await access(fileURLToPath(new URL(`public${asset.src}`, root)));
  }
  catch {
    errors.push(`${owner}: missing ${asset.src}`);
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
  const files = new Set(media.map(item => item.asset.src));
  const provisional = new Set(media.filter(item => !item.asset.approved).map(item => item.asset.src));
  console.log(`Asset/config validation passed: 6 columns, 18 flag targets, 5 sub-item tiles, 3 local SVG flags, ${files.size} media files.`);
  console.log(`${provisional.size} media files are provisional (approved: false), not client-approved assets.`);
}
