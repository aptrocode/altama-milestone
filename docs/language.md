# Column languages

Each of six columns independently selects Indonesian (`id`, default), English (`en`), or Simplified Chinese (`zh-Hans`). The language chooser is available only while idle. Choosing it updates only that column's copy/accessibility labels. Open content retains the chosen language and rejects hidden language actions; return to idle to choose again. Other columns remain unchanged.

A fresh load starts every column in Indonesian. Manual Back and R/Escape preserve languages immediately. Thirty seconds without interaction restores that column to idle/Indonesian, including a translated column that is already idle.

## Ownership

- `shared/wall.ts`: supported languages and typed language action.
- `app/data/columns/*.ts`: translated column/sub-item labels and page copy (paragraphs, bullets, numbered lists, tab labels), one file per column. Every section title differs per language, except column 6: the event name **ALTAMA SUMMIT 2026** stays in English in all three (client request).
- `app/data/wall-copy.ts`: interface phrases, language names, local flag paths.
- `app/stores/wall.ts`: serializable locale per column.
- `useWallController`: language action and inactivity lifecycle.
- `WallLanguageSwitcher`: three flag-only buttons floating absolute inside the lower card area only while idle, independent of the full-card hold button.
- `WallColumnPill`: the column title pill, which follows that column's language.
- `shared/installation-layout.json`: 18 logical language targets.

Controls use spoken names, `aria-pressed`, selected border/glow, and a separate focus outline. Column, header, and footer set their own `lang`. The English cue uses the UK flag; Chinese means Simplified Chinese.

No i18n/icon dependency is needed. Add each translated phrase to the typed copy maps rather than branching language logic throughout components. Asset/config validation checks every column and sub-item in all three languages. Company claims/translations require client review. Indonesian slide copy comes from the Summit mockups; English and Chinese are drafted translations except the client-supplied Mandarin paragraph for Tentang Altama, the five bullets each for Infrastruktur and Digital Trust, and the profile facts and award entries for Tekiro (eleven awards), RYU (three awards), and Rexco (five awards), including counts and years. Their Mandarin market-segment/product copy remains a drafted translation.

Sensor language selection uses protocol v2 `input` with `action: { type: "language", columnId: 1, locale: "zh-Hans" }`. Deploy matching wall-v7 geometry before enabling it; see [sensor](./sensor.md).
