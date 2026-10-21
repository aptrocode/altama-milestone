import type { DwellInput } from '../sensor-service/dwell';
import type { ColumnId, PublishedColumn } from '../shared/wall';
import { describe, expect, it } from 'vitest';
import { DwellEngine } from '../sensor-service/dwell';
import { hitTest, isInsideRect, visibleTargets } from '../shared/sensor-targets';
import { COLUMN_IDS } from '../shared/wall';

const idle: PublishedColumn = { phase: 'idle', locale: 'id', subItem: '', photo: 0, page: 0, photoCount: 2, pageCount: 2 };
const allIdle = Object.fromEntries(COLUMN_IDS.map(id => [id, idle])) as Record<ColumnId, PublishedColumn>;

describe('visible targets', () => {
  it('shows flags, main, and tiles only while idle; columns 2/5 have tiles and no main', () => {
    const keys = visibleTargets(allIdle).map(item => item.key);
    expect(keys).toContain('1:main');
    expect(keys).toContain('1:language:zh-Hans');
    expect(keys).toContain('2:subItem:rexco');
    expect(keys).toContain('5:subItem:pemasaran');
    expect(keys).not.toContain('2:main');
    expect(keys).not.toContain('5:main');
    expect(keys.some(key => key.includes('back') || key.includes('page') || key.includes('next'))).toBe(false);
  });

  it('shows Back, arrows only with several photos, and only existing page tabs while open', () => {
    const open = (photoCount: number, pageCount: number) => visibleTargets({ 1: { ...idle, phase: 'active', photoCount, pageCount } }).map(item => item.key);
    expect(open(1, 1)).toEqual(['1:back']);
    expect(open(3, 1)).toEqual(['1:back', '1:previous', '1:next']);
    // The visible page's tab (page 0 here) is inert, so only the other tab is a target.
    expect(open(1, 2)).toEqual(['1:back', '1:page:1']);
    expect(visibleTargets({ 1: { ...idle, phase: 'active', page: 1, photoCount: 1, pageCount: 2 } }).map(item => item.key)).toEqual(['1:back', '1:page:0']);
    expect(visibleTargets({})).toEqual([]);
  });

  it('drops the Back target when the wall hides its close button', () => {
    const open = { 1: { ...idle, phase: 'active' as const, photoCount: 3, pageCount: 2 } };
    expect(visibleTargets(open).map(item => item.key)).toContain('1:back');
    expect(visibleTargets(open, { showClose: false }).map(item => item.key)).toEqual(['1:previous', '1:next', '1:page:1']);
  });

  it('moves the language targets to the full-width bar and keeps main excluded under it', () => {
    const compact = visibleTargets(allIdle).filter(item => item.key.startsWith('1:'));
    const full = visibleTargets(allIdle, { languageBar: 'full' }).filter(item => item.key.startsWith('1:'));
    const flags = full.filter(item => item.action.type === 'language');
    const main = full.find(item => item.key === '1:main')!;
    expect(flags.map(item => item.key)).toEqual(compact.filter(item => item.action.type === 'language').map(item => item.key));
    // Three equal buttons spanning the frame between its 14 px insets, wider and taller than compact.
    expect(flags[0]!.rect.x).toBe(main.rect.x + 22);
    expect(flags[2]!.rect.x + flags[2]!.rect.width).toBeCloseTo(main.rect.x + main.rect.width - 22);
    expect(flags[0]!.rect.width).toBeGreaterThan(compact.find(item => item.key === '1:language:id')!.rect.width);
    expect(flags[0]!.rect.height).toBe(60);
    for (const flag of flags)
      expect(isInsideRect(flag.rect.x + 1, flag.rect.y + 1, main.exclude!)).toBe(true);
  });

  it('stacks the grid language bar 2 + 1 and grows main downward', () => {
    const compact = visibleTargets(allIdle).filter(item => item.key.startsWith('1:'));
    const grid = visibleTargets(allIdle, { languageBar: 'grid' }).filter(item => item.key.startsWith('1:'));
    const flag = (locale: string) => grid.find(item => item.key === `1:language:${locale}`)!.rect;
    const main = grid.find(item => item.key === '1:main')!;
    const compactMain = compact.find(item => item.key === '1:main')!;
    // ID left and EN right on one row, 中文 centred below them.
    expect(flag('id').y).toBe(flag('en').y);
    expect(flag('en').x).toBeGreaterThan(flag('id').x + flag('id').width);
    expect(flag('zh-Hans').y).toBe(flag('id').y + flag('id').height + 6);
    expect(flag('zh-Hans').x + flag('zh-Hans').width / 2).toBeCloseTo(main.rect.x + main.rect.width / 2);
    expect(flag('id').width).toBeGreaterThan(150);
    // The frame grows by one button row, the gap, and the 10 px drop; every flag stays inside it and excluded from main.
    expect(main.rect.height).toBe(compactMain.rect.height + 76);
    // The whole column moves up by the grid raise (on top of the card offset).
    expect(main.rect.y).toBe(compactMain.rect.y - 40);
    expect(flag('zh-Hans').y + flag('zh-Hans').height).toBeLessThan(main.rect.y + main.rect.height);
    for (const locale of ['id', 'en', 'zh-Hans'])
      expect(isInsideRect(flag(locale).x + 1, flag(locale).y + 1, main.exclude!)).toBe(true);
  });

  it('grows the Back target around its centre with the close size and moves it by X/Y', () => {
    const open = { 1: { ...idle, phase: 'active' as const, photoCount: 1, pageCount: 1 } };
    const base = visibleTargets(open).find(item => item.key === '1:back')!.rect;
    const big = visibleTargets(open, { close: { scale: 2, x: 0, y: 0 } }).find(item => item.key === '1:back')!.rect;
    expect(big.width).toBe(base.width * 2);
    expect(big.x + big.width / 2).toBe(base.x + base.width / 2);
    expect(big.y + big.height / 2).toBe(base.y + base.height / 2);
    const moved = visibleTargets(open, { close: { scale: 1, x: -20, y: 10 } }).find(item => item.key === '1:back')!.rect;
    expect([moved.x, moved.y]).toEqual([base.x - 20, base.y + 10]);
  });

  it('lays out three page tabs, and moves tabs to the top of a card without photos', () => {
    const three = { 1: { ...idle, phase: 'active' as const, photoCount: 0, pageCount: 3, tabsTop: true } };
    const tabs = visibleTargets(three).filter(item => item.action.type === 'page').map(item => item.rect);
    // Page 0 is visible (inert), so pages 1 and 2 are targets: half-width tabs across the card's
    // inner width at the card top (y 512 + 35), the third centred under them, same gap across and down.
    expect(tabs).toHaveLength(2);
    const [second, third] = tabs as [typeof tabs[0], typeof tabs[0]];
    const first = visibleTargets({ 1: { ...idle, phase: 'active' as const, photoCount: 0, pageCount: 3, tabsTop: true, page: 1 } }).find(item => item.key === '1:page:0')!.rect;
    expect(tabs.every(rect => rect.width === first.width)).toBe(true);
    expect([first.y, second.y, third.y]).toEqual([547, 547, 547 + 40 + 8]);
    expect(second.x - (first.x + first.width)).toBe(8);
    expect(third.x + third.width / 2).toBe((first.x + second.x + second.width) / 2);
    const two = visibleTargets({ 1: { ...idle, phase: 'active' as const, photoCount: 2, pageCount: 2 } }).find(item => item.action.type === 'page')!.rect;
    expect([two.width, two.y]).toEqual([112, 707]);
  });

  it('lays out four page tabs as 2 + 2 half-width tabs', () => {
    const four = { 1: { ...idle, phase: 'active' as const, photoCount: 0, pageCount: 4, tabsTop: true, page: 3 } };
    const rects = visibleTargets(four).filter(item => item.action.type === 'page').map(item => item.rect);
    expect(rects).toHaveLength(3);
    const [first, second, third] = rects as [typeof rects[0], typeof rects[0], typeof rects[0]];
    expect([first.y, second.y, third.y]).toEqual([547, 547, 595]);
    expect(third.x).toBe(first.x);
    expect(second.x - (first.x + first.width)).toBe(8);
  });

  it('drops the page tabs when the wall hides them (auto page)', () => {
    const open = { 1: { ...idle, phase: 'active' as const, photoCount: 3, pageCount: 2 } };
    expect(visibleTargets(open, { showPages: false }).map(item => item.key)).toEqual(['1:back', '1:previous', '1:next']);
  });

  it('keeps the page tabs of a tabsAlways column (scroll mode, section 2) with the tabs switched off', () => {
    const open = { 1: { ...idle, phase: 'active' as const, photoCount: 3, pageCount: 2, tabsAlways: true } };
    expect(visibleTargets(open, { showPages: false }).map(item => item.key)).toContain('1:page:1');
  });

  it('drops the photo arrows when the wall hides them (auto slide)', () => {
    const open = { 1: { ...idle, phase: 'active' as const, photoCount: 3, pageCount: 2 } };
    expect(visibleTargets(open, { showArrows: false }).map(item => item.key)).toEqual(['1:back', '1:page:1']);
  });

  it('moves every target with the dashboard card offset', () => {
    const base = visibleTargets(allIdle);
    const raised = visibleTargets(allIdle, { offsetY: -40 });
    expect(raised.map(item => item.rect.y)).toEqual(base.map(item => item.rect.y - 40));
    expect(hitTest(136, 1017 - 40, raised)?.key).toBe('1:language:id');
    expect(hitTest(212, 700 - 40, raised)?.key).toBe('1:main');
  });

  it('lets flags win over main and ignores the language overlay padding', () => {
    const targets = visibleTargets(allIdle);
    expect(hitTest(136, 1017, targets)?.key).toBe('1:language:id');
    expect(hitTest(90, 1000, targets)).toBeNull();
    expect(hitTest(212, 700, targets)?.key).toBe('1:main');
    expect(hitTest(400, 700, targets)).toBeNull();
  });
});

describe('dwell engine', () => {
  // Hold rules for card, page, and slider (1 s dwell), so these tests exercise the service's dwell;
  // the dashboard defaults are Tap + delay, which the service treats as a short contact.
  const HOLD_RULES = { card: { mode: 'hold', seconds: 1 }, page: { mode: 'hold', seconds: 1 }, slider: { mode: 'hold', seconds: 1 }, language: { mode: 'tap', seconds: 1 }, back: { mode: 'tap', seconds: 1 } };
  function setup(hold: unknown = HOLD_RULES) {
    const inputs: DwellInput[] = [];
    const engine = new DwellEngine({ onInput: input => inputs.push(input) });
    engine.setHold(hold);
    engine.setTargets(visibleTargets(allIdle), 0);
    return { engine, inputs };
  }

  it('fires a hold target once after its configured dwell', () => {
    const { engine, inputs } = setup();
    engine.update([{ id: 'p', x: 212, y: 700 }], 0);
    engine.update([{ id: 'p', x: 214, y: 702 }], 990);
    expect(inputs).toEqual([]);
    engine.tick(1_000);
    expect(inputs.map(i => i.target.action)).toEqual([{ type: 'main', columnId: 1 }]);
    engine.update([{ id: 'p', x: 214, y: 702 }], 5_000);
    expect(inputs).toHaveLength(1);
  });

  it('uses the dashboard duration current when the contact reached the target', () => {
    const { engine, inputs } = setup({ card: { enabled: true, seconds: 2.5 } });
    engine.update([{ id: 'p', x: 588, y: 600 }], 0);
    engine.setHold({ card: { enabled: true, seconds: 0.5 } });
    engine.tick(2_400);
    expect(inputs).toEqual([]);
    engine.tick(2_500);
    expect(inputs[0]!.target.action).toEqual({ type: 'subItem', columnId: 2, subItemId: 'tekiro' });
  });

  it('still requires a short deliberate contact when hold is off, and for language', () => {
    const { engine, inputs } = setup({ card: { enabled: false, seconds: 1 } });
    engine.update([{ id: 'a', x: 212, y: 700 }, { id: 'b', x: 588, y: 1017 }], 0);
    engine.tick(200);
    expect(inputs).toEqual([]);
    engine.tick(250);
    expect(inputs.map(i => i.target.key).sort()).toEqual(['1:main', '2:language:en']);
    engine.tick(2_000);
    expect(inputs).toHaveLength(2);
  });

  it('ignores passers-by, restarts on another target, and tolerates edge jitter', () => {
    const { engine, inputs } = setup();
    engine.update([{ id: 'p', x: 212, y: 700 }], 0);
    engine.update([], 600);
    engine.update([{ id: 'q', x: 588, y: 600 }], 700);
    engine.update([{ id: 'q', x: 588, y: 760 }], 1_400);
    engine.tick(2_300);
    expect(inputs).toEqual([]);
    engine.update([{ id: 'q', x: 588, y: 830 }], 2_350);
    engine.update([{ id: 'q', x: 588, y: 760 }], 2_400);
    engine.tick(3_290);
    expect(inputs).toEqual([]);
    engine.tick(3_300);
    expect(inputs.map(i => i.target.key)).toEqual(['2:subItem:ryu']);
    expect(inputs[0]).toMatchObject({ pointerId: 'q', x: 588, y: 760 });
  });

  it('previews progress and never fires while suppressed (calibration)', () => {
    const { engine, inputs } = setup();
    engine.suppressed = true;
    engine.update([{ id: 'p', x: 212, y: 700 }], 0);
    expect(engine.preview(500)).toEqual([{ id: 'p', x: 212, y: 700, target: '1:main', progress: 0.5, fired: false }]);
    engine.tick(5_000);
    expect(inputs).toEqual([]);
  });

  it('re-targets when the column snapshot changes under a contact', () => {
    const { engine, inputs } = setup();
    engine.update([{ id: 'p', x: 356, y: 524 }], 0);
    engine.setTargets(visibleTargets({ ...allIdle, 1: { ...idle, phase: 'active' } }), 300);
    engine.tick(540);
    expect(inputs).toEqual([]);
    engine.tick(550);
    expect(inputs.map(i => i.target.key)).toEqual(['1:back']);
  });

  it('does not fire contacts left on a target when calibration mode ends', () => {
    const { engine, inputs } = setup();
    engine.suppressed = true;
    engine.update([{ id: 'p', x: 212, y: 700 }], 0);
    engine.tick(3_000);
    engine.suppressed = false;
    engine.update([{ id: 'p', x: 212, y: 700 }], 3_030);
    engine.tick(6_000);
    expect(inputs).toEqual([]);
    engine.update([{ id: 'q', x: 212, y: 700 }], 6_100);
    engine.tick(7_100);
    expect(inputs.map(i => i.pointerId)).toEqual(['q']);
  });
});
