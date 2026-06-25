// Dungeon content: mob templates that only spawn inside instances, spawn
// lists, and the DungeonDef registry merged by sim/data.ts.

import type { DungeonDef, DungeonSpawn, MobTemplate } from '../types';

export const DUNGEON_MOBS: Record<string, MobTemplate> = {
  // ---- Forgotten Crypt (L5–10, three wings: Entrance / Catacombs / Ritual Chamber) ----
  skeleton_warrior: {
    id: 'skeleton_warrior', name: 'Skeleton Warrior', minLevel: 5, maxLevel: 7, family: 'undead',
    hpBase: 34, hpPerLevel: 12, dmgBase: 5, dmgPerLevel: 1.6, attackSpeed: 2.2,
    armorPerLevel: 12, moveSpeed: 6.5, aggroRadius: 11,
    loot: [{ copper: 45, chance: 1 }, { itemId: 'bone_fragments', chance: 0.55 }],
    scale: 1.0, color: 0xc8cfc8,
  },
  skeleton_archer: {
    id: 'skeleton_archer', name: 'Skeleton Archer', minLevel: 5, maxLevel: 8, family: 'undead',
    hpBase: 28, hpPerLevel: 10, dmgBase: 4, dmgPerLevel: 1.5, attackSpeed: 2.4,
    armorPerLevel: 8, moveSpeed: 6, aggroRadius: 14,
    petRole: 'ranged_dps',
    petSpell: { name: 'Bone Arrow', school: 'physical', min: 4, max: 8, range: 26, every: 2.2 },
    loot: [{ copper: 50, chance: 1 }, { itemId: 'bone_fragments', chance: 0.45 }],
    scale: 0.95, color: 0xb8c4c4,
  },
  restless_spirit: {
    id: 'restless_spirit', name: 'Restless Spirit', minLevel: 6, maxLevel: 8, family: 'undead',
    hpBase: 30, hpPerLevel: 11, dmgBase: 6, dmgPerLevel: 1.7, attackSpeed: 2.0,
    armorPerLevel: 6, moveSpeed: 7.5, aggroRadius: 12,
    loot: [{ copper: 55, chance: 1 }, { itemId: 'ghostly_essence', chance: 0.35 }],
    scale: 0.9, color: 0x9bb8d4,
  },
  crypt_cultist: {
    id: 'crypt_cultist', name: 'Crypt Cultist', minLevel: 7, maxLevel: 9, family: 'humanoid',
    hpBase: 36, hpPerLevel: 13, dmgBase: 7, dmgPerLevel: 1.9, attackSpeed: 2.1,
    armorPerLevel: 10, moveSpeed: 7, aggroRadius: 12,
    loot: [{ copper: 65, chance: 1 }, { itemId: 'linen_scrap', chance: 0.5 }],
    scale: 1.0, color: 0x5b2c6f,
  },
  crypt_hound: {
    id: 'crypt_hound', name: 'Crypt Hound', minLevel: 6, maxLevel: 8, family: 'beast',
    hpBase: 32, hpPerLevel: 12, dmgBase: 6, dmgPerLevel: 1.8, attackSpeed: 1.7,
    armorPerLevel: 10, moveSpeed: 8.5, aggroRadius: 13,
    loot: [{ copper: 48, chance: 1 }, { itemId: 'bone_fragments', chance: 0.4 }],
    scale: 1.15, color: 0x566573,
  },
  bone_guardian: {
    id: 'bone_guardian', name: 'Bone Guardian', minLevel: 7, maxLevel: 9, family: 'undead', elite: true,
    hpBase: 38, hpPerLevel: 8, dmgBase: 8, dmgPerLevel: 2.2, attackSpeed: 2.4,
    armorPerLevel: 22, moveSpeed: 6.5, aggroRadius: 14,
    loot: [
      { copper: 350, chance: 1 },
      { itemId: 'bone_shield', chance: 0.45, rollGroup: 'bone_guardian_gear' },
      { itemId: 'crypt_blade', chance: 0.35, rollGroup: 'bone_guardian_gear' },
    ],
    scale: 1.25, color: 0xaeb6bf,
  },
  cult_adept: {
    id: 'cult_adept', name: 'Cult Adept', minLevel: 8, maxLevel: 9, family: 'humanoid', elite: true,
    hpBase: 72, hpPerLevel: 18, dmgBase: 8, dmgPerLevel: 2.2, attackSpeed: 2.0,
    armorPerLevel: 14, moveSpeed: 7, aggroRadius: 13,
    aoePulse: { min: 8, max: 12, radius: 10, every: 12, name: 'Shadow Bolt' },
    loot: [
      { copper: 280, chance: 1 },
      { itemId: 'cultist_robes', chance: 0.5, rollGroup: 'cult_adept_gear' },
      { itemId: 'ancient_ring', chance: 0.25, rollGroup: 'cult_adept_gear' },
    ],
    scale: 1.05, color: 0x6c3483,
  },
  crypt_warden: {
    id: 'crypt_warden', name: 'The Crypt Warden', minLevel: 8, maxLevel: 10, family: 'undead',
    elite: true, boss: true,
    hpBase: 90, hpPerLevel: 14, dmgBase: 8, dmgPerLevel: 2.0, attackSpeed: 2.5,
    armorPerLevel: 22, moveSpeed: 7, aggroRadius: 16,
    cleave: { radius: 8, mult: 0.35, name: 'Cleave' },
    summonAdds: { mobId: 'skeleton_warrior_add', count: 1, atHpPct: [0.15] },
    stomp: { radius: 10, every: 10, duration: 1.0, min: 10, max: 16, name: 'Ground Slam' },
    loot: [
      { copper: 2200, chance: 1 },
      { itemId: 'crypt_blade', chance: 0.34, rollGroup: 'warden_guaranteed_uncommon' },
      { itemId: 'cultist_robes', chance: 0.33, rollGroup: 'warden_guaranteed_uncommon' },
      { itemId: 'bone_shield', chance: 0.33, rollGroup: 'warden_guaranteed_uncommon' },
      { itemId: 'wardens_hammer', chance: 0.22, rollGroup: 'warden_bonus' },
      { itemId: 'ancient_ring', chance: 0.15, rollGroup: 'warden_bonus' },
      { itemId: 'morthen_grimoire', chance: 1 },
    ],
    scale: 1.35, color: 0x4a235a,
  },
  // Summoned by the Crypt Warden — no loot.
  skeleton_warrior_add: {
    id: 'skeleton_warrior_add', name: 'Skeleton Warrior', minLevel: 8, maxLevel: 8, family: 'undead',
    hpBase: 16, hpPerLevel: 7, dmgBase: 2, dmgPerLevel: 0.9, attackSpeed: 2.2,
    armorPerLevel: 10, moveSpeed: 6.5, aggroRadius: 10,
    loot: [],
    scale: 1.0, color: 0xc8cfc8,
  },

  // ---- The Sunken Bastion (5-player elite instance, ~L13) ----
  bastion_revenant: {
    id: 'bastion_revenant', name: 'Bastion Revenant', minLevel: 12, maxLevel: 13, family: 'undead', elite: true,
    hpBase: 54, hpPerLevel: 21, dmgBase: 9, dmgPerLevel: 2.4, attackSpeed: 2.3,
    armorPerLevel: 18, moveSpeed: 6.5, aggroRadius: 12,
    loot: [{ copper: 150, chance: 1 }, { itemId: 'bone_fragments', chance: 0.7 }],
    scale: 1.1, color: 0x7fa8a0,
    mortalStrike: { chance: 0.3, healReduction: 0.5, duration: 6, name: 'Mortal Strike' },
  },
  tidebound_acolyte: {
    id: 'tidebound_acolyte', name: 'Tidebound Acolyte', minLevel: 12, maxLevel: 13, family: 'humanoid', elite: true,
    hpBase: 50, hpPerLevel: 20, dmgBase: 10, dmgPerLevel: 2.5, attackSpeed: 2.0,
    armorPerLevel: 14, moveSpeed: 7, aggroRadius: 12,
    loot: [{ copper: 170, chance: 1 }, { itemId: 'linen_scrap', chance: 0.5 }],
    desperateHeal: { belowHpPct: 0.3, healPct: 0.25 },
    scale: 1.0, color: 0x1f618d,
  },
  drowned_thrall: {
    id: 'drowned_thrall', name: 'Drowned Thrall', minLevel: 11, maxLevel: 11, family: 'undead',
    hpBase: 40, hpPerLevel: 14, dmgBase: 7, dmgPerLevel: 2.0, attackSpeed: 2.0,
    armorPerLevel: 10, moveSpeed: 7.5, aggroRadius: 12,
    loot: [], // summoned add — nothing to loot
    scale: 0.95, color: 0x6fae9e,
  },
  knight_commander_olen: {
    id: 'knight_commander_olen', name: 'Knight-Commander Olen', minLevel: 13, maxLevel: 13, family: 'undead', elite: true,
    hpBase: 120, hpPerLevel: 26, dmgBase: 11, dmgPerLevel: 2.6, attackSpeed: 2.2,
    armorPerLevel: 24, moveSpeed: 7, aggroRadius: 14,
    loot: [
      { copper: 800, chance: 1 },
      { itemId: 'trollhide_leggings', chance: 0.50, rollGroup: 'olen_guaranteed_uncommon' },
      { itemId: 'marshstrider_boots', chance: 0.50, rollGroup: 'olen_guaranteed_uncommon' },
      { itemId: 'fenmist_robe', chance: 0.25, rollGroup: 'olen_bonus' },
      { itemId: 'tideguard_greaves', chance: 0.10, rollGroup: 'olen_bonus' },
      { itemId: 'tideguard_sabatons', chance: 0.10, rollGroup: 'olen_bonus' },
      { itemId: 'eelscale_leggings', chance: 0.10, rollGroup: 'olen_bonus' },
    ], // his greaves are Maren's quest reward, not a drop
    scale: 1.2, color: 0x95a5a6,
    cleave: { radius: 8, mult: 0.6, name: 'Cleave' },
  },
  vael_the_mistcaller: {
    id: 'vael_the_mistcaller', name: 'Vael the Mistcaller', minLevel: 13, maxLevel: 13, family: 'humanoid',
    elite: true, boss: true,
    hpBase: 240, hpPerLevel: 34, dmgBase: 12, dmgPerLevel: 2.6, attackSpeed: 2.4,
    armorPerLevel: 26, moveSpeed: 7, aggroRadius: 16,
    aoePulse: { min: 16, max: 24, radius: 12, every: 10, name: 'Mist Surge' },
    summonAdds: { mobId: 'drowned_thrall', count: 2, atHpPct: [0.6, 0.3] },
    loot: [
      { copper: 5000, chance: 1 },
      { itemId: 'trollhide_leggings', chance: 0.34, rollGroup: 'vael_guaranteed_uncommon' },
      { itemId: 'marshstrider_boots', chance: 0.33, rollGroup: 'vael_guaranteed_uncommon' },
      { itemId: 'fenmist_robe', chance: 0.33, rollGroup: 'vael_guaranteed_uncommon' },
      { itemId: 'deepfen_pearl', chance: 1 },
      { itemId: 'eelskin_tunic', chance: 0.20, rollGroup: 'vael_bonus' },
      { itemId: 'tidescale_vest', chance: 0.10, rollGroup: 'vael_bonus' },
      { itemId: 'drowned_prayer_leggings', chance: 0.10, rollGroup: 'vael_bonus' },
      { itemId: 'drowned_prayer_sandals', chance: 0.10, rollGroup: 'vael_bonus' },
      { itemId: 'eelscale_treads', chance: 0.10, rollGroup: 'vael_bonus' },
    ],
    scale: 1.35, color: 0x48c9b0,
  },

  // ---- Gravewyrm Sanctum (5-player elite instance, L20 finale) ----
  sanctum_boneguard: {
    id: 'sanctum_boneguard', name: 'Sanctum Boneguard', minLevel: 19, maxLevel: 19, family: 'undead', elite: true,
    hpBase: 64, hpPerLevel: 23, dmgBase: 12, dmgPerLevel: 2.7, attackSpeed: 2.3,
    armorPerLevel: 22, moveSpeed: 6.5, aggroRadius: 12,
    loot: [{ copper: 300, chance: 1 }, { itemId: 'bone_fragments', chance: 0.6 }],
    scale: 1.15, color: 0xcfc8b0,
  },
  sanctum_drakonid: {
    id: 'sanctum_drakonid', name: 'Sanctum Drakonid', minLevel: 19, maxLevel: 20, family: 'dragonkin', elite: true,
    hpBase: 68, hpPerLevel: 24, dmgBase: 13, dmgPerLevel: 2.8, attackSpeed: 2.2,
    armorPerLevel: 26, moveSpeed: 7, aggroRadius: 13,
    loot: [{ copper: 350, chance: 1 }, { itemId: 'cracked_wyrm_scale', chance: 0.5 }],
    scale: 1.45, color: 0x567d46, // Korzul's rig at 0.8x his bulk
  },
  raised_bonewalker: {
    id: 'raised_bonewalker', name: 'Raised Bonewalker', minLevel: 18, maxLevel: 18, family: 'undead',
    hpBase: 42, hpPerLevel: 15, dmgBase: 9, dmgPerLevel: 2.2, attackSpeed: 2.2,
    armorPerLevel: 12, moveSpeed: 7, aggroRadius: 12,
    loot: [], // summoned add — nothing to loot
    scale: 1.0, color: 0xc8cfc8,
  },
  korgath_the_bound: {
    id: 'korgath_the_bound', name: 'Korgath the Bound', minLevel: 20, maxLevel: 20, family: 'ogre', elite: true,
    hpBase: 260, hpPerLevel: 36, dmgBase: 14, dmgPerLevel: 2.9, attackSpeed: 2.8,
    armorPerLevel: 30, moveSpeed: 7, aggroRadius: 15,
    enrage: { belowHpPct: 0.30, dmgMult: 1.5, hasteMult: 1.3 },
    stomp: { radius: 10, every: 12, duration: 1.5, min: 20, max: 30, name: 'War Stomp' },
    loot: [
      { copper: 5000, chance: 1 },
      { itemId: 'boneplate_vest', chance: 0.34, rollGroup: 'korgath_guaranteed_uncommon' },
      { itemId: 'revenant_silk_robe', chance: 0.33, rollGroup: 'korgath_guaranteed_uncommon' },
      { itemId: 'nightwalk_jerkin', chance: 0.33, rollGroup: 'korgath_guaranteed_uncommon' },
      { itemId: 'zealotsbane_blade', chance: 0.20, rollGroup: 'korgath_bonus' },
      { itemId: 'korgaths_chainwraps', chance: 0.10, rollGroup: 'korgath_bonus' },
      { itemId: 'staff_of_velkhar', chance: 0.10, rollGroup: 'korgath_bonus' },
      { itemId: 'shadowmeld_tunic', chance: 0.10, rollGroup: 'korgath_bonus' },
      { itemId: 'wyrmcult_grand_robe', chance: 0.10, rollGroup: 'korgath_bonus' },
      { itemId: 'gravewyrm_sabatons', chance: 0.10, rollGroup: 'korgath_bonus' },
      { itemId: 'wyrmcult_soulsteps', chance: 0.10, rollGroup: 'korgath_bonus' },
      { itemId: 'wyrmshadow_treads', chance: 0.05, rollGroup: 'korgath_bonus' },
    ],
    scale: 1.5, color: 0x8f6f46,
  },
  grand_necromancer_velkhar: {
    id: 'grand_necromancer_velkhar', name: 'Grand Necromancer Velkhar', minLevel: 20, maxLevel: 20, family: 'humanoid', elite: true,
    hpBase: 230, hpPerLevel: 33, dmgBase: 13, dmgPerLevel: 2.8, attackSpeed: 2.0,
    armorPerLevel: 20, moveSpeed: 7, aggroRadius: 15,
    summonAdds: { mobId: 'raised_bonewalker', count: 3, atHpPct: [0.66, 0.33] },
    loot: [
      { copper: 5000, chance: 1 },
      { itemId: 'boneplate_vest', chance: 0.34, rollGroup: 'velkhar_guaranteed_uncommon' },
      { itemId: 'revenant_silk_robe', chance: 0.33, rollGroup: 'velkhar_guaranteed_uncommon' },
      { itemId: 'nightwalk_jerkin', chance: 0.33, rollGroup: 'velkhar_guaranteed_uncommon' },
      { itemId: 'emberwood_staff', chance: 0.20, rollGroup: 'velkhar_bonus' },
      { itemId: 'boneguard_breastplate', chance: 0.10, rollGroup: 'velkhar_bonus' },
      { itemId: 'shadowmeld_tunic', chance: 0.10, rollGroup: 'velkhar_bonus' },
      { itemId: 'staff_of_velkhar', chance: 0.10, rollGroup: 'velkhar_bonus' },
      { itemId: 'gravewyrm_stalkers_treads', chance: 0.10, rollGroup: 'velkhar_bonus' },
      { itemId: 'deathlord_legguards', chance: 0.05, rollGroup: 'velkhar_bonus' },
      { itemId: 'necromancers_soulsteps', chance: 0.05, rollGroup: 'velkhar_bonus' },
      { itemId: 'wyrmshadow_legguards', chance: 0.05, rollGroup: 'velkhar_bonus' },
    ],
    scale: 1.25, color: 0x512e5f,
  },
  korzul_the_gravewyrm: {
    id: 'korzul_the_gravewyrm', name: 'Korzul the Gravewyrm', minLevel: 20, maxLevel: 20, family: 'dragonkin',
    elite: true, boss: true,
    hpBase: 420, hpPerLevel: 48, dmgBase: 15, dmgPerLevel: 3.0, attackSpeed: 2.6,
    armorPerLevel: 34, moveSpeed: 7, aggroRadius: 18,
    aoePulse: { min: 30, max: 42, radius: 14, every: 8, name: 'Necrotic Shockwave' },
    enrage: { belowHpPct: 0.30, dmgMult: 1.5, hasteMult: 1.3 },
    loot: [
      { copper: 50000, chance: 1 },
      { itemId: 'boneplate_vest', chance: 0.34, rollGroup: 'korzul_guaranteed_uncommon' },
      { itemId: 'revenant_silk_robe', chance: 0.33, rollGroup: 'korzul_guaranteed_uncommon' },
      { itemId: 'nightwalk_jerkin', chance: 0.33, rollGroup: 'korzul_guaranteed_uncommon' },
      { itemId: 'cultist_flayer', chance: 0.10, rollGroup: 'korzul_bonus' },
      { itemId: 'wyrmfang_greatblade', chance: 0.05, rollGroup: 'korzul_bonus' },
      { itemId: 'staff_of_the_gravewyrm', chance: 0.05, rollGroup: 'korzul_bonus' },
      { itemId: 'fang_of_korzul', chance: 0.05, rollGroup: 'korzul_bonus' },
      { itemId: 'deathlord_warplate', chance: 0.05, rollGroup: 'korzul_bonus' },
      { itemId: 'necromancers_starshroud', chance: 0.05, rollGroup: 'korzul_bonus' },
      { itemId: 'wyrmshadow_harness', chance: 0.05, rollGroup: 'korzul_bonus' },
    ],
    scale: 1.8, color: 0x3d5c45,
  },
};

// Forgotten Crypt: Entrance (z ~18–40), Catacombs (~50–82), Ritual Chamber (~95+).
const CRYPT_SPAWN_LIST: DungeonSpawn[] = [
  // Entrance wing
  { mobId: 'skeleton_warrior', x: -3, z: 18 },
  { mobId: 'skeleton_archer', x: 3, z: 19 },
  { mobId: 'crypt_hound', x: -8, z: 28 },
  { mobId: 'skeleton_warrior', x: 6, z: 32 },
  { mobId: 'restless_spirit', x: 0, z: 40 },
  // Catacombs
  { mobId: 'crypt_cultist', x: -9, z: 52 },
  { mobId: 'skeleton_archer', x: 5, z: 55 },
  { mobId: 'crypt_hound', x: 8, z: 62 },
  { mobId: 'restless_spirit', x: -4, z: 68 },
  { mobId: 'cult_adept', x: 2, z: 72 },
  { mobId: 'skeleton_warrior', x: -6, z: 78 },
  { mobId: 'bone_guardian', x: 0, z: 82 },
  // Ritual chamber
  { mobId: 'crypt_warden', x: 0, z: 98 },
  { mobId: 'skeleton_warrior', x: -5, z: 95 },
  { mobId: 'skeleton_warrior', x: 5, z: 95 },
];

// Sunken Bastion: same 13-spawn pacing as the crypt — packs of 2 elites,
// the Knight-Commander as miniboss, then Vael on the dais with two guards.
const BASTION_SPAWN_LIST: DungeonSpawn[] = [
  { mobId: 'bastion_revenant', x: -3, z: 18 },
  { mobId: 'bastion_revenant', x: 3, z: 19 },
  { mobId: 'bastion_revenant', x: -9, z: 38 },
  { mobId: 'tidebound_acolyte', x: -5, z: 39 },
  { mobId: 'tidebound_acolyte', x: 9, z: 54 },
  { mobId: 'bastion_revenant', x: 5, z: 55 },
  { mobId: 'bastion_revenant', x: -5, z: 68 },
  { mobId: 'tidebound_acolyte', x: -1, z: 70 },
  { mobId: 'knight_commander_olen', x: -4, z: 82 },
  { mobId: 'bastion_revenant', x: 1, z: 83 },
  { mobId: 'vael_the_mistcaller', x: 0, z: 98 },
  { mobId: 'tidebound_acolyte', x: -4, z: 96 },
  { mobId: 'bastion_revenant', x: 4, z: 96 },
];

// Gravewyrm Sanctum: three chambers — the Boneworks (z<60), the Ritual Vault
// (75-115) and the Wyrm's Hollow (115+) — with Korgath holding the first
// waist, Velkhar the second, and Korzul on the great dais at the end.
const SANCTUM_SPAWN_LIST: DungeonSpawn[] = [
  { mobId: 'sanctum_boneguard', x: -3, z: 16 },
  { mobId: 'sanctum_boneguard', x: 3, z: 17 },
  { mobId: 'sanctum_boneguard', x: -8, z: 30 },
  { mobId: 'sanctum_drakonid', x: -4, z: 31 },
  { mobId: 'sanctum_drakonid', x: 7, z: 44 },
  { mobId: 'sanctum_boneguard', x: 3, z: 45 },
  { mobId: 'sanctum_boneguard', x: -6, z: 58 },
  { mobId: 'sanctum_drakonid', x: -2, z: 59 },
  { mobId: 'korgath_the_bound', x: 0, z: 72 },
  { mobId: 'sanctum_drakonid', x: -7, z: 86 },
  { mobId: 'sanctum_boneguard', x: -3, z: 87 },
  { mobId: 'sanctum_boneguard', x: 6, z: 100 },
  { mobId: 'sanctum_drakonid', x: 2, z: 101 },
  { mobId: 'grand_necromancer_velkhar', x: 0, z: 114 },
  { mobId: 'sanctum_boneguard', x: -4, z: 112 },
  { mobId: 'sanctum_boneguard', x: 4, z: 112 },
  { mobId: 'sanctum_drakonid', x: -5, z: 130 },
  { mobId: 'sanctum_drakonid', x: -1, z: 132 },
  { mobId: 'korzul_the_gravewyrm', x: 0, z: 146 },
  { mobId: 'sanctum_drakonid', x: -5, z: 144 },
  { mobId: 'sanctum_drakonid', x: 5, z: 144 },
];

export const DUNGEON_DEFS: Record<string, DungeonDef> = {
  hollow_crypt: {
    id: 'hollow_crypt',
    name: 'Forgotten Crypt',
    index: 0,
    doorPos: { x: 80, z: 90 },
    entry: { x: 0, z: 4 },
    exitOffset: { x: 0, z: -6 },
    spawns: CRYPT_SPAWN_LIST,
    interior: 'crypt',
    suggestedPlayers: 1,
    enterText: 'You descend into the Forgotten Crypt. Torchlight gutters in the stale air.',
    leaveText: 'You climb back into daylight, grateful for the sun.',
  },
  sunken_bastion: {
    id: 'sunken_bastion',
    name: 'The Sunken Bastion',
    index: 1,
    doorPos: { x: 45, z: 515 }, // drowned keep south of the Gravecaller camp
    entry: { x: 0, z: 4 },
    exitOffset: { x: 0, z: -6 },
    spawns: BASTION_SPAWN_LIST,
    interior: 'crypt',
    suggestedPlayers: 5,
    enterText: 'You wade down into the Sunken Bastion...',
    leaveText: 'You climb out of the drowning dark.',
  },
  gravewyrm_sanctum: {
    id: 'gravewyrm_sanctum',
    name: 'Gravewyrm Sanctum',
    index: 2,
    doorPos: { x: 0, z: 880 }, // sealed gate at the head of the Sanctum Approach
    entry: { x: 0, z: 4 },
    exitOffset: { x: 0, z: -6 },
    spawns: SANCTUM_SPAWN_LIST,
    interior: 'sanctum',
    suggestedPlayers: 5,
    enterText: 'The air goes cold. Something vast breathes below...',
    leaveText: 'You stagger back into the mountain wind.',
  },
};
