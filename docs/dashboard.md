# Operator dashboard

`/dashboard` is a small configuration page for operators. It currently controls hold (dwell) behaviour only.

| Group | Buttons | Default |
| --- | --- | --- |
| Card section (`card`) | Idle main card of columns 1/3/4/6 and the sub-item tiles of columns 2/5 | On, 1.0 s |
| Button page (`page`) | Page tabs (1960 / 1996, PAGE 1 / PAGE 2) | On, 1.0 s |
| Button slider (`slider`) | Photo arrows | On, 1.0 s |

- **On** with a duration (0.3–5 s, 0.1 s steps): the button must be held; the border progress animation follows the duration.
- **Off**: the button activates on a normal press.
- Language flags and Back (✕) always activate on a normal press. Keyboard Enter/Space always activate immediately.
- **Simpan** applies the edit, **Default** loads the defaults (save to apply), **Export/Import** download or load `altama-hold-settings.json` as a backup or to copy settings to another machine.

## Storage and scope

- Settings live in this browser's `localStorage` (`altama.settings.v1`) through `app/plugins/settings-storage.client.ts`. Open the dashboard in the same browser profile as the wall on the event PC. A wall already open in another tab updates immediately (storage event); no reload is needed.
- Clearing browser data restores the defaults; keep an exported JSON as backup.
- There is no server or login. The page is not secret: anyone who can type a URL on the kiosk browser can open it. The wall runs fullscreen, so visitors cannot reach it in practice.
- `bun run generate` emits `dashboard/index.html`, so the URL works on plain static hosting too; the `Buka wall` link navigates back to `/`.

## Code

- `shared/hold-settings.ts`: groups, defaults, limits, `normalizeHoldSettings`, and the action → group map (`HOLD_GROUP_BY_ACTION`).
- `app/stores/settings.ts`: serializable settings state.
- `app/components/wall/WallHoldButton.vue`: reads its `group` rule and passes `{ enabled, durationMs }` to the `v-hold` directive (`app/utils/hold.ts`).
- `app/pages/dashboard.vue`: the form.

To add another setting, extend the store state and normalizer, persist it through the same plugin, and add a section to the dashboard.

## Sensor Service

The wall publishes the current rules as `hold` in every `clientHello`/`clientState` message, so LiDAR input follows the same configuration. See [sensor](./sensor.md).
