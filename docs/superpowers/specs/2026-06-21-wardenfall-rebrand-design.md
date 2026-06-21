# Rebrand: World of Warden → Wardenfall

**Date:** 2026-06-21
**Status:** Approved — in execution
**Scope:** Name + visual identity (brand strings + asset slots). Gameplay/lore untouched.

## Goal
Replace the brand phrase **"World of Warden" → "Wardenfall"** everywhere it is user- or
operator-facing, finish the leftover **"ClaudeCraft" → Wardenfall** cleanup from the prior
incomplete rebrand, and convert brand image references into clean drop-in slots so externally
authored art (Gemini) lands at the right paths/names/alt-text. Artwork itself is out of scope.

## Hard rule — brand phrase only
Rename only the multi-word brand `World of Warden`. **Never** touch the standalone lore word
`Warden` (e.g. *Warden Fenwick*, *Warden of Fenbridge* in `src/sim/content/zone2.ts`). A blind
find-replace would corrupt lore.

## Confirmed decisions
- **Domain:** placeholder `wardenfall.example.com` in SEO URLs (real domain TBD).
- **Repo identity:** `package.json` name → `wardenfall`. Working folder NOT renamed.
- **Tagline:** kept → title reads `Wardenfall: Classic-Style Web MMO`.

## Invariants honored
- i18n: every brand string is a `t()` key in all 13 locales (`src/ui/i18n.ts`) + admin
  (`src/admin/i18n.ts`); sim/server player text routes through `server_i18n.ts`/`sim_i18n.ts`
  matchers in the same change. Guards: `tests/localization_fixes.test.ts`,
  `tests/localization_coverage.test.ts`.
- Determinism / sim purity unaffected (no sim logic changes).

## Execution — ordered steps (checkpoint after each)
**Reordered per owner: website first.**

1. **Website (public-facing).** `index.html` + `admin.html` titles & meta, ~20 SEO URLs →
   placeholder domain, og/twitter/schema, `manifest.webmanifest` name/short_name, title-screen +
   loading-screen logo alt/paths, and the `seo.*` / `serverUnavailable.*` / social-label /
   install-step i18n values across all 13 locales.
2. **Asset slots.** `git mv` brand images to `wardenfall-*` and repoint refs:
   `wardenfall-logo.png` (title + loading wordmark), `wardenfall-square.png` (OG; replaces stray
   `woc_logo_square.webp`), favicon set (`favicon.ico`, `favicon-16/32`, `icon-192`,
   `apple-touch-icon` 180), `loading-screen.jpg`.
3. **Core code strings.** `src/main.ts` (world name + comment), `server/main.ts`, `server/game.ts`
   (player-facing `world.entered` broadcast, paired with `server_i18n.ts` matcher), `src/game/perf.ts`.
4. **ClaudeCraft leftovers + infra/docs.** `mediawiki/seed/pages.xml`,
   `scripts/mediawiki/build_seed.mjs`, `deploy/user-data.sh`, `Dockerfile`, `docker-compose.yml`,
   `package.json` name, `README.md`/docs, `.env.example`, `.github/` templates.
5. **Tests + verify.** Update brand assertions in
   `tests/{server_i18n,localization_fixes,homepage_foundation,social_system}.test.ts`; then
   `npx tsc --noEmit` · `npm test` · `npm run build` green.

## Out of scope
Logo/menu artwork (Gemini), folder rename, in-world class/zone/lore reskin.
