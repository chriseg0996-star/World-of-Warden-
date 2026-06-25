// ---------------------------------------------------------------------------
// Shaman talent content — Elemental vs Restoration identity. Simple trees tuned
// for the level-5 unlock: two level-10 shamans can diverge clearly on burst
// spell damage vs ancestral healing without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'sha_convection', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { ability: [{ ability: 'lightning_bolt', costPct: -0.05 }, { ability: 'earth_shock', costPct: -0.05 }] },
    icon: 'v', name: 'Convection', description: 'Reduces Lightning Bolt and Earth Shock costs by 5% per rank.',
    row: 0, col: 0,
  },
  {
    id: 'sha_ancestral_knowledge', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { int: 2 } },
    icon: '*', name: 'Ancestral Knowledge', description: 'Increases Intellect by 2 per rank.',
    row: 0, col: 2,
  },
  {
    id: 'sha_shielding', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['sha_convection'],
    effect: { ability: [{ ability: 'lightning_shield', dmgPct: 0.15 }], stats: { armorPct: 0.03 } },
    icon: '#', name: 'Improved Lightning Shield', description: 'Strengthens Lightning Shield and armor per rank.',
    row: 1, col: 0,
  },
  {
    id: 'sha_tidal_focus', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['sha_ancestral_knowledge'],
    effect: { ability: [{ ability: 'healing_wave', costPct: -0.05 }] },
    icon: '+', name: 'Tidal Focus', description: 'Reduces Healing Wave cost by 5% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'sha_elemental_calling', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'sha_calling_elemental', name: 'Elemental Fury', icon: '*', description: 'Increases spell damage by 6%.', effect: { global: { spellDmgPct: 0.06 } } },
      { id: 'sha_calling_restoration', name: 'Healing Grace', icon: '+', description: 'Increases healing by 6%.', effect: { global: { healPct: 0.06 } } },
    ],
    icon: '⬡', name: 'Elemental Calling', description: 'Choose an emphasis for your path.',
    row: 2, col: 1,
  },
];

const ELEMENTAL_NODES: TalentNode[] = [
  {
    id: 'ele_concussion', tree: 'spec', specId: 'elemental', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'lightning_bolt', dmgPct: 0.08 }] },
    icon: '*', name: 'Concussion', description: 'Increases Lightning Bolt damage by 8%.',
    row: 0, col: 0,
  },
  {
    id: 'ele_call_flame', tree: 'spec', specId: 'elemental', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'flame_shock', dmgPct: 0.08 }] },
    icon: 'x', name: 'Call of Flame', description: 'Increases Flame Shock damage by 8%.',
    row: 0, col: 2,
  },
  {
    id: 'ele_reverberation', tree: 'spec', specId: 'elemental', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'earth_shock', cooldownPct: -0.12 }, { ability: 'frost_shock', cooldownPct: -0.12 }] },
    icon: '>', name: 'Reverberation', description: 'Reduces Shock cooldowns by 12% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'ele_elemental_focus', tree: 'spec', specId: 'elemental', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { global: { spellDmgPct: 0.05 } },
    icon: 'v', name: 'Elemental Focus', description: 'Increases spell damage by 5% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'ele_lightning_mastery', tree: 'spec', specId: 'elemental', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'lightning_bolt', castPct: -0.08, dmgPct: 0.10 }] },
    icon: '*', name: 'Lightning Mastery', description: 'Improves Lightning Bolt cast time and damage per rank.',
    row: 2, col: 0,
  },
  {
    id: 'ele_elemental_fury', tree: 'spec', specId: 'elemental', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['ele_concussion'],
    effect: { global: { spellDmgPct: 0.06 }, stats: { crit: 0.02 } },
    icon: '*', name: 'Elemental Fury', description: 'Increases spell damage and critical strike per rank.',
    row: 3, col: 1,
  },
];

const RESTORATION_NODES: TalentNode[] = [
  {
    id: 'rest_imp_healing_wave', tree: 'spec', specId: 'restoration', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'healing_wave', dmgPct: 0.08 }] },
    icon: '+', name: 'Improved Healing Wave', description: 'Increases Healing Wave healing by 8%.',
    row: 0, col: 0,
  },
  {
    id: 'rest_healing_grace', tree: 'spec', specId: 'restoration', kind: 'passive', maxRank: 1,
    effect: { global: { healPct: 0.05 } },
    icon: '+', name: 'Healing Grace', description: 'Increases healing done by 5%.',
    row: 0, col: 2,
  },
  {
    id: 'rest_ancestral_healing', tree: 'spec', specId: 'restoration', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { armorPct: 0.05 }, global: { healPct: 0.03 } },
    icon: '#', name: 'Ancestral Healing', description: 'Increases armor and healing per rank.',
    row: 1, col: 0,
  },
  {
    id: 'rest_tidal_mastery', tree: 'spec', specId: 'restoration', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'healing_wave', castPct: -0.10, costPct: -0.08 }] },
    icon: 'v', name: 'Tidal Mastery', description: 'Makes Healing Wave faster and cheaper per rank.',
    row: 1, col: 2,
  },
  {
    id: 'rest_nature_blessing', tree: 'spec', specId: 'restoration', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { global: { healPct: 0.05 }, stats: { spi: 2 } },
    icon: '+', name: 'Nature Blessing', description: 'Increases healing and Spirit per rank.',
    row: 2, col: 0,
  },
  {
    id: 'rest_ancestral_guidance', tree: 'spec', specId: 'restoration', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['rest_imp_healing_wave'],
    effect: { global: { healPct: 0.07 }, stats: { int: 2 } },
    icon: '+', name: 'Ancestral Guidance', description: 'Increases healing and Intellect per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'elemental', class: 'shaman', name: 'Elemental', role: 'dps', icon: '*',
    description: 'A ranged caster who calls lightning, flame, and frost.',
    signature: 'lightning_bolt',
    mastery: { name: 'Elemental Fury', description: 'Increases spell damage and critical strike chance.', effect: { global: { spellDmgPct: 0.10 }, stats: { crit: 0.02 } } },
  },
  {
    id: 'restoration', class: 'shaman', name: 'Restoration', role: 'healer', icon: '+',
    description: 'A healer using ancestral waves and efficient nature magic.',
    signature: 'healing_wave',
    mastery: { name: 'Purification', description: 'Increases healing done by 14%.', effect: { global: { healPct: 0.14 } } },
  },
];

export const SHAMAN_TALENTS: ClassTalents = {
  class: 'shaman',
  nodes: [...CLASS_NODES, ...ELEMENTAL_NODES, ...RESTORATION_NODES],
  specs: SPECS,
};
