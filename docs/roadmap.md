# World of Warden — Massive Multi-Year Upgrade Roadmap

## Context

World of Warden is a freshly-rebranded fork of the open-source `world-of-claudecraft`
MMO: a deterministic, WoW-Classic-fidelity micro-MMO whose single `src/sim/` core runs
identically in three hosts (offline browser, authoritative server, headless RL env).
Current verified state on `main`: `tsc` clean, **1237 tests / 122 files green**, `npm run build`
succeeds. The game today ships 9 classes (137 ability defs with ranks), a **complete** talent
system (41+ nodes/class, loadouts, base64 build strings), 3 zones (levels 1–20), 3 dungeons
(9 bosses), ~61 quests (kill/collect only), ~260 mobs, ~164 items (only 4 armor slots, no sets),
basic economy (vendor + one auction house + trade, copper-only), party/guild/duel/arena(Elo)
social, a partial post-cap virtual-level system, and a single-agent RL env. It is a
production-grade engine; the gaps are **content breadth, deep systems, and live-ops/scale**, not
architecture.

**Goal:** a sequenced, multi-year roadmap that keeps the proven WoW-Classic mechanics and lore
intact and stacks new content/systems/tech on top — 16 dense phases plus a long tail. Owner
priorities (chosen): **content breadth · new systems · tech & live-ops**; **level cap stays 20
with post-cap progression first, then raises in phases**; graphics overhaul is a deferred parallel
track, not an early priority.

## Non-negotiable invariants (every phase honors these)

- **Determinism:** 20 Hz tick (`DT=1/20`); all randomness via `Rng` (`src/sim/rng.ts`) — never
  `Math.random`/`Date.now`/`performance.now` in sim logic. Same seed ⇒ same world.
- **Sim purity:** `src/sim/` has zero DOM/Three/`fs`/HTTP imports and never imports
  `render/`/`ui/`/`game/`/`net/`. New gameplay logic lives in the sim and is **server-authoritative**.
- **`IWorld` seam:** render/ui talk only to `src/world_api.ts` (`IWorld`); new state surfaces by
  extending `IWorld` and implementing in both `Sim` and `ClientWorld` (`src/net/online.ts`).
- **i18n-complete:** every player-visible string is a `t()` key registered in **all 13 locales**
  in `src/ui/i18n.ts` (+ admin `src/admin/i18n.ts`); sim/server text routes through the
  `sim_i18n.ts`/`server_i18n.ts` matchers in the same change. Guard:
  `tests/localization_fixes.test.ts` + `tests/localization_coverage.test.ts`.
- **No secrets; `ALLOW_DEV_COMMANDS` dev-only.** Don't hand-edit `*.generated.ts`.
- **Per-phase Definition of Done:** `npx tsc --noEmit` clean · `npm test` green (new tests added) ·
  `npm run build` succeeds · full i18n · mobile + `?lowgfx` still playable · Conventional Commit
  with scope (`feat(crafting): …`).

## Reusable hook points (found during exploration — extend these, don't reinvent)

- Derived stats: **`recalcPlayerStats()`** in `src/sim/entity.ts` (the one place stats are computed).
- Ability resolution: `abilitiesKnownAt(cls, level)` + effect runner in `src/sim/sim.ts`;
  talent flats via `computeTalentModifiers()` (`src/sim/content/talents.ts`).
- Content registries (data-as-code): `src/sim/content/classes.ts` (`CLASSES`, `ABILITIES`),
  `zone1/2/3.ts`, `items.ts`, `dungeons.ts`, merged in `src/sim/data.ts`.
- XP/leveling/formulas + tuning constants: `src/sim/types.ts` (`XP_TABLE`, `MAX_LEVEL`, hit/armor).
- Server loop, command dispatch, interest/snapshots: `server/game.ts`; persistence + DDL:
  `server/db.ts` (character JSONB, `world_state`); social/guild: `server/social*.ts`.
- HUD windows (one `Hud` class, DOM, no framework): `src/ui/hud.ts`; procedural icons:
  `src/ui/icons.ts`; post-cap bar: `src/ui/xp_bar.ts`; meters: `src/ui/meters.ts`.
- RL: `headless/env_server.ts` + `src/sim/obs.ts` (action/obs encoding) + `python/wow_env.py`.
- Existing design specs to follow: `docs/prd/max-level-xp-overflow.md`,
  `docs/prd/talents-and-specializations.md`, `docs/design/ue5-overhaul-plan.md`,
  `docs/design/graphics-plan.md`, `docs/design/icon-system.md`, `docs/design/spell-ranks.md`.

---

## ERA I — Foundations & Endgame-at-20

### Phase 1 — Engine & Live-Ops Foundations *(enabler; low gameplay risk)*
- **Code-splitting:** dynamic-import the heavy render subsystems (terrain/dungeon/water/props) and
  per-zone content to cut the ~3.2 MB monolith below the 1.5 MB warning (`vite.config.ts`).
- **DB migrations:** add `server/migrations/` + a versioned runner; replace inline DDL in
  `server/db.ts` with applied, ordered migrations (auto-apply on boot).
- **Instance manager:** generalize today's party/dungeon instance-key into a real per-group
  instance service with lifecycle + lockout hooks (unblocks raids/housing/BGs).
- **Observability:** server `/metrics` (tick ms, online, heap), structured logs, crash capture.
- **CI hardening:** wire `scripts/visual_tour.mjs` pixel-diff + `mp_integration.mjs` into CI;
  mipmap procedural textures; optional asset-CDN env (`MEDIA_URL_TEMPLATE`).
- **Verify:** bundle-size assertion; migration apply/rollback test; instance lifecycle e2e; CI green.

### Phase 2 — Post-Cap Progression & Leaderboards *(completes a stubbed system; PRD exists)*
- Finish lifetime-XP overflow + **virtual levels** + **prestige ranks** with real rewards (remove the
  three XP-cap gates per `docs/prd/max-level-xp-overflow.md`); cosmetic **paragon milestones**
  (titles, mount/pet unlocks) at flat XP intervals.
- **Leaderboards API** (`/api/leaderboard`) with category boards: lifetime XP, arena Elo, dungeon
  clears, DPS/HPS; in-game board UI + `src/ui/xp_bar.ts` polish.
- Optional opt-in **prestige reset** (badge, no power creep).
- **Verify:** post-cap grind sim test; cap-gate removal tests; leaderboard cache/TTL tests; milestone unlocks.

### Phase 3 — Itemization Overhaul *(foundation for all future gear)*
- Expand `ItemDef` slots to the full set (head/neck/shoulder/back/wrist/hands/waist/legs/feet/
  2×ring/trinket) + paperdoll in the character window (`hud.ts`); wire into `recalcPlayerStats()`.
- **Set items** (`setId` + threshold bonuses), **trinkets** with on-use/proc effects, weapon variety
  (2H/ranged/off-hand/shield), item-level/quality stat budgets.
- **Verify:** stat-recompute tests across all slots; set-bonus activation tests; equip/swap e2e.

## ERA II — Living World & Professions

### Phase 4 — Quest System Expansion *(richer content authoring for every later zone)*
- New `QuestObjective` types: escort, defend/survive, use-object/channel, talk-to, explore, boss-kill,
  timed; quest **chains/branches**; **daily/weekly** repeatables; world quests.
- Quest-tracking UI upgrades in the quest log; deterministic daily/weekly reset.
- **Verify:** one test per objective type; reset-determinism test; chain/branch state machine tests.

### Phase 5 — Professions & Crafting I *(gathering + first crafts)*
- **Gathering:** mining/herbalism/skinning with deterministic world node spawns; skill 0–300.
- **Crafting framework** in the sim (server-authoritative): recipes (inputs→output), craft action,
  skill-up curve; first lines: blacksmithing, alchemy (feeds combat potions), cooking, first-aid.
- New profession UI windows (reuse `hud.ts` window pattern; procedural recipe icons via `icons.ts`).
- **Verify:** gather determinism; skill-up curve test; recipe I/O + reagent-consumption tests.

### Phase 6 — Professions & Crafting II *(full economy loop)*
- Remaining professions: tailoring, leatherworking, enchanting, engineering, jewelcrafting; crafted
  gear competitive with dungeon drops; reagent drops from mobs; recipe drops/discovery.
- **Currency tiers** (copper→silver→gold) + sinks; AH integration for crafted goods; profession quests.
- **Verify:** economy-balance harness; AH e2e with crafted listings; currency rollover tests.

## ERA III — Social Depth

### Phase 7 — Guilds 2.0 *(in-game UI + progression)*
- Full in-game guild UI (roster, ranks, permissions, MOTD), **guild bank/vault** (tabs+logs+perms),
  **guild levels & perks** (XP boost, vendor discount, summon), guild achievements.
- **Hooks:** `server/social*.ts` + `world_state` guild JSONB; new HUD social panels.
- **Verify:** perk-application tests; vault concurrency; permission-matrix tests.

### Phase 8 — Player & Guild Housing
- Instanced housing plots + guild halls (via Phase 1 instance manager); build/decorate with
  crafted furniture (money/crafting sink); visitor permissions; persistence in character/guild state.
- **Verify:** housing persistence round-trip; instance routing; decoration-placement determinism.

## ERA IV — The Great Expansion (phased cap raise)

### Phase 9 — Level-Cap Raise Foundations (20 → 30)
- Extend `XP_TABLE`, per-level stat curves, **new ability ranks 21–30** (data in `classes.ts`),
  talent points beyond 20, and mob/zone scaling anchors in `types.ts`; rebalance hit/armor at new levels.
- **Verify:** extend `progression.test.ts`; balance-sim harness for 21–30 (TTK windows, gray bands).

### Phase 10 — New Zones & Dungeons (21–30 content)
- 2–3 new zones (new biomes), 2 new dungeons, new mob families + rares + a roaming **world boss**;
  ~80 new quests using Phase-4 types; new itemization tier (Phase 3 slots/sets).
- **Verify:** zone content/load-validation tests; boss-mechanic tests; visual tour for new zones.

### Phase 11 — First Raid (10-player endgame)
- 10-player raid instance, multi-phase encounters extending the data-driven boss-mechanic system
  (aoePulse/summonAdds/enrage/stomp/cleave + new: stacking/spread/soft-enrage), **weekly lockouts**,
  raid-tier set gear, raid frames + master/loot-council options.
- **Verify:** deterministic encounter scripts; lockout persistence; 10-bot raid e2e via headless sim.

## ERA V — Competitive & Live

### Phase 12 — PvP Expansion
- **Battlegrounds** (objective maps: capture/escort/resource) via instance manager; open-world PvP /
  war mode; **2v2 & 3v3** arena brackets on the existing Elo system; rated seasons + rewards;
  honor currency + PvP gear.
- **Verify:** BG-objective sim tests; matchmaking/bracket tests; season rollover.

### Phase 13 — Seasons, Events & Cosmetics *(live-ops engine)*
- Seasonal ladder resets; **world events** (invasions, holiday events) on a deterministic scheduler;
  **reward track / battle pass**; cosmetics shop (**mounts** with real speed, vanity **pets**,
  **transmog**/appearance, titles); daily login rewards.
- Admin live-ops: scheduling, **bulk moderation**, automation rules, Discord webhooks, SSE live stats.
- **Verify:** event-scheduling determinism; cosmetic unlock/equip flow; admin e2e.

### Phase 14 — Netcode & Scale
- **Client-side movement prediction + reconciliation** (movement only; outcomes stay server-side);
  **binary snapshot codec** (MessagePack) + adaptive snapshot rates; reconnect/resume; spatial chat
  falloff; **dungeon/raid finder** queue; cross-realm social API; multi-realm ops tooling.
- **Verify:** prediction-vs-server correctness; bandwidth benchmark (`tests/bandwidth.test.ts`);
  reconnect e2e; load test at 100+ simulated clients.

### Phase 15 — RL & AI Platform
- Richer `obs.ts` (configurable mob count, full aura list, line-of-sight, ally/party state);
  **multi-agent/party** training; **curriculum** (warm-start level/difficulty); trajectory/replay
  export; reward-analysis tooling. Optional: policy-driven **AI denizens** populating live worlds.
- **Verify:** env API contract tests; multi-agent determinism; `npm run bench` throughput gate.

## DEFERRED PARALLEL TRACK

### Phase 16 — Graphics & Audio Overhaul *(non-blocking; sim unchanged)*
- Execute `docs/design/ue5-overhaul-plan.md` (11 steps) + `graphics-plan.md` (post-processing, SSAO,
  PBR terrain, IBL per biome, water, foliage, LOD, shadows) and the `docs/design/icon-system.md`
  compositor; richer procedural audio (ADSR, convolver reverb, ambient beds). **`?lowgfx` Lambert
  path must stay alive.**
- **Verify:** per-step screenshot gates; mobile perf budget; low-tier playable.

## LONG TAIL (sketch, post-Phase-16)
Cap raise 30→40→60 (repeat Era IV pattern) · tier-2/3 raids + 20-player raid · profession
masteries & legendary crafts · reputation/faction grind & rewards · auction-house analytics ·
guild-vs-guild territory war · replay sharing site · mod/asset SDK.

---

## Verification strategy (end-to-end, per phase)
1. **Unit/sim:** add/extend Vitest in `tests/` (e.g., `progression.test.ts`, `talents.test.ts`,
   `snapshots.test.ts`); prefer single-file runs while iterating (`npx vitest run tests/<f>.test.ts`),
   full `npm test` before commit.
2. **i18n guard:** `tests/localization_fixes.test.ts` + `localization_coverage.test.ts` must pass; run
   `scripts/localization_e2e.mjs` for new player-facing surfaces.
3. **Integration/e2e:** `scripts/mp_integration.mjs`, `social_e2e.mjs`, `chat_e2e.mjs`,
   `market_mp_e2e.mjs` against `npm run server` for any server-touching phase.
4. **Visual:** `scripts/visual_tour.mjs` / `smoke_browser.mjs` against `npm run dev`; mobile + `?lowgfx`.
5. **Determinism/balance:** seeded multi-thousand-step sim replays; balance harness for any tuning.
6. **Build & types:** `npx tsc --noEmit` + `npm run build` (+ `build:server`, `build:env`) green.

## Execution notes
- Eras I–III are buildable now at cap 20 (no cap-raise dependency); Era IV is the mid-game pivot.
- Phase 1 (instance manager, migrations, code-split) is a prerequisite for Phases 8, 11, 12.
- Phase 3 (itemization) should precede Phases 6, 10, 11 (gear-dependent).
- Each phase is independently shippable and leaves `main` green; large phases can be split into
  numbered sub-phases (e.g., 5a/5b) using the same Goal→Deliverables→Hooks→Verify shape.
