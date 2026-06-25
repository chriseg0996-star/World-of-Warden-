// ---------------------------------------------------------------------------
// Mage talent content — Fire vs Frost identity. Simple trees tuned for the
// level-5 unlock: two level-10 mages can diverge clearly on burst damage vs
// control and survival without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'mag_arcane_study', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { int: 2 } },
    icon: '*', name: 'Arcane Study', description: 'Increases Intellect by 2 per rank.',
    row: 0, col: 0,
  },
  {
    id: 'mag_frost_warding', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { sta: 2 } },
    icon: '#', name: 'Frost Warding', description: 'Increases Stamina by 2 per rank.',
    row: 0, col: 2,
  },
  {
    id: 'mag_improved_fireball', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['mag_arcane_study'],
    effect: { ability: [{ ability: 'fireball', dmgPct: 0.10 }] },
    icon: 'x', name: 'Improved Fireball', description: 'Increases Fireball damage by 10% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'mag_improved_frostbolt', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['mag_frost_warding'],
    effect: { ability: [{ ability: 'frostbolt', dmgPct: 0.10 }] },
    icon: '#', name: 'Improved Frostbolt', description: 'Increases Frostbolt damage by 10% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'mag_school_path', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'mag_path_fire', name: 'Ignite', icon: 'x', description: 'Increases spell damage by 4%.', effect: { global: { spellDmgPct: 0.04 } } },
      { id: 'mag_path_frost', name: 'Permafrost', icon: '#', description: 'Increases maximum health by 4%.', effect: { stats: { maxHpPct: 0.04 } } },
    ],
    icon: '⬡', name: 'School Path', description: 'Choose an emphasis for your spellcasting.',
    row: 2, col: 1,
  },
];

const FIRE_NODES: TalentNode[] = [
  {
    id: 'fire_pyromancy', tree: 'spec', specId: 'fire', kind: 'passive', maxRank: 1,
    effect: { global: { spellDmgPct: 0.05 } },
    icon: 'x', name: 'Pyromancy', description: 'Increases spell damage by 5%.',
    row: 0, col: 0,
  },
  {
    id: 'fire_critical_mass', tree: 'spec', specId: 'fire', kind: 'passive', maxRank: 1,
    effect: { stats: { crit: 0.05 } },
    icon: '🎯', name: 'Critical Mass', description: 'Increases critical strike chance by 5%.',
    row: 0, col: 2,
  },
  {
    id: 'fire_burning_soul', tree: 'spec', specId: 'fire', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'fire_blast', dmgPct: 0.15 }] },
    icon: '*', name: 'Burning Soul', description: 'Increases Fire Blast damage by 15% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'fire_kindling', tree: 'spec', specId: 'fire', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { int: 3 } },
    icon: '📈', name: 'Kindling', description: 'Increases Intellect by 3 per rank.',
    row: 1, col: 2,
  },
  {
    id: 'fire_incinerate', tree: 'spec', specId: 'fire', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'scorch', dmgPct: 0.12 }] },
    icon: 'x', name: 'Incinerate', description: 'Increases Scorch damage by 12% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'fire_combustion', tree: 'spec', specId: 'fire', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['fire_pyromancy'],
    effect: { ability: [{ ability: 'fireball', dmgPct: 0.12 }] },
    icon: '☄', name: 'Combustion', description: 'Increases Fireball damage by 12% per rank.',
    row: 3, col: 1,
  },
];

const FROST_NODES: TalentNode[] = [
  {
    id: 'frost_ice_shards', tree: 'spec', specId: 'frost', kind: 'passive', maxRank: 1,
    effect: { stats: { armorPct: 0.10 } },
    icon: '#', name: 'Ice Shards', description: 'Increases armor by 10%.',
    row: 0, col: 0,
  },
  {
    id: 'frost_winter_vitality', tree: 'spec', specId: 'frost', kind: 'passive', maxRank: 1,
    effect: { stats: { maxHpPct: 0.05 } },
    icon: '♥', name: 'Winter Vitality', description: 'Increases maximum health by 5%.',
    row: 0, col: 2,
  },
  {
    id: 'frost_permafrost', tree: 'spec', specId: 'frost', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { armorPct: 0.04 } },
    icon: '#', name: 'Permafrost', description: 'Increases armor by 4% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'frost_shatter', tree: 'spec', specId: 'frost', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { crit: 0.01 } },
    icon: 'x', name: 'Shatter', description: 'Increases critical strike chance by 1% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'frost_cold_snap', tree: 'spec', specId: 'frost', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'frost_nova', cooldownPct: -0.12, dmgPct: 0.10 }] },
    icon: 'O', name: 'Cold Snap', description: 'Improves Frost Nova cooldown and damage per rank.',
    row: 2, col: 0,
  },
  {
    id: 'frost_barrier_mastery', tree: 'spec', specId: 'frost', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['frost_winter_vitality'],
    effect: { ability: [{ ability: 'ice_barrier', dmgPct: 0.15 }], stats: { maxHpPct: 0.04 } },
    icon: '💠', name: 'Barrier Mastery', description: 'Strengthens Ice Barrier and maximum health per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'fire', class: 'mage', name: 'Fire', role: 'dps', icon: 'x',
    description: 'A burst caster who trades safety for explosive Fire damage.',
    signature: 'scorch',
    mastery: { name: 'Ignite', description: 'Increases spell damage by 8% and critical strike chance by 2%.', effect: { global: { spellDmgPct: 0.08 }, stats: { crit: 0.02 } } },
  },
  {
    id: 'frost', class: 'mage', name: 'Frost', role: 'dps', icon: '#',
    description: 'A controlling caster who slows foes and survives longer in the crypt.',
    signature: 'ice_barrier',
    mastery: { name: 'Winter\'s Embrace', description: 'Increases spell damage by 6% and armor by 8%.', effect: { global: { spellDmgPct: 0.06 }, stats: { armorPct: 0.08 } } },
  },
];

export const MAGE_TALENTS: ClassTalents = {
  class: 'mage',
  nodes: [...CLASS_NODES, ...FIRE_NODES, ...FROST_NODES],
  specs: SPECS,
};
