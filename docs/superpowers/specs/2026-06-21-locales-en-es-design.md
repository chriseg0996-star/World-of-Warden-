# Locale trim: 14 → English + Spanish

**Date:** 2026-06-21
**Status:** Implemented
**Owner decision:** Wardenfall is a solo fork; ship in English + Spanish only.

## Why
The upstream project supported 14 UI locales, and the i18n guards
(`tests/localization_coverage.test.ts`) require **every** quest/mob/item/zone string
translated into all locales with no English fallback — even checking translation
*quality*. That made every new piece of content a 13-language translation task. Trimming
to `en` + `es` collapses that to ~1, which is the right trade for a solo fork. Spanish is
kept because the owner is a Spanish speaker.

## What changed
- **`src/ui/i18n.ts`**: removed the 12 non-en/es `: typeof en` locale objects and their
  `gameStrings*` variants; `translations` now maps only `{ en, es }`, so
  `SupportedLanguage = 'en' | 'es'` and `supportedLanguages = ['en', 'es']`. This is the
  source of truth — `tsc` propagates the 2-locale contract everywhere.
- **`src/ui/sim_i18n.ts`** / **`src/ui/talent_i18n.ts`**: removed the 12 locale entries from
  the `Record<SupportedLanguage, …>` dictionaries (forced by the narrowed type).
- **`src/ui/server_i18n.ts`** / **`src/admin/i18n.ts`**: pruned the 12 locale keys from the
  string DICTs (kept en + es).
- **`index.html`**: removed 12 `hreflang` alternates and 12 picker `<option>`s.
- **Tests**: `localization_coverage`, `localization_fixes`, `homepage_foundation`,
  `chat_context_menu` rewritten to validate en + es only (foreign-locale spot-checks
  replaced with structural `es` assertions: no fallback, not English, interpolation
  preserved).
- **Scripts/docs**: `scripts/localization_e2e.mjs` + `scripts/homepage_verify.mjs` arrays
  trimmed; `docs/i18n/*.md` reduced to the `es` pair; `src/ui/CLAUDE.md` note updated.

## Deferred (harmless dead data — not on the runtime path)
These were left intact to avoid fragile hand-cuts of irregular blocks; they are never
read because `supportedLanguages = ['en','es']`, and `noUnusedLocals` is off so they do
not break `tsc`:
- `src/ui/phase9_i18n.ts`: the 12 non-en/es per-locale data blocks + `phase9` entries/aliases.
- `src/ui/sim_i18n.ts`: orphaned `PET_DICT_<LOCALE>` helper consts (no longer referenced).
A later cleanup pass can delete these. They have zero gameplay/SEO/runtime effect.

## Re-adding a locale later
Add it back to `translations` in `i18n.ts` (a full `: typeof en` object), restore its
entity translations, add the `hreflang`/`<option>`, and extend the coverage tests.

## Verification
`npx tsc --noEmit` clean · `npm test` green (1242) · client + server builds succeed.
