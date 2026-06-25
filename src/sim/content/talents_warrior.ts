// ---------------------------------------------------------------------------
// Warrior talent content — Offense vs Defense identity. Simple trees tuned for
// the level-5 unlock: two level-10 warriors can diverge clearly on damage vs
// survivability without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'war_battle_training', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { str: 2 } },
    icon: '⚔', name: 'Battle Training', description: 'Increases Strength by 2 per rank.',
    row: 0, col: 0,
  },
  {
    id: 'war_endurance', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { sta: 2 } },
    icon: '♥', name: 'Endurance', description: 'Increases Stamina by 2 per rank.',
    row: 0, col: 2,
  },
  {
    id: 'war_improved_strike', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['war_battle_training'],
    effect: { ability: [{ ability: 'heroic_strike', dmgPct: 0.10 }] },
    icon: '💢', name: 'Improved Strike', description: 'Increases Heroic Strike damage by 10% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'war_shield_discipline', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['war_endurance'],
    effect: { stats: { armorPct: 0.03 } },
    icon: '🛡', name: 'Shield Discipline', description: 'Increases armor by 3% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'war_combat_path', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'war_path_offense', name: 'Offensive Stance', icon: '⚔', description: 'Increases melee ability damage by 4%.', effect: { global: { meleeDmgPct: 0.04 } } },
      { id: 'war_path_defense', name: 'Defensive Stance', icon: '🛡', description: 'Increases maximum health by 4%.', effect: { stats: { maxHpPct: 0.04 } } },
    ],
    icon: '⬡', name: 'Combat Path', description: 'Choose an emphasis for your fighting style.',
    row: 2, col: 1,
  },
];

const OFFENSE_NODES: TalentNode[] = [
  {
    id: 'off_brutality', tree: 'spec', specId: 'offense', kind: 'passive', maxRank: 1,
    effect: { global: { meleeDmgPct: 0.05 } },
    icon: '⚔', name: 'Brutality', description: 'Increases all melee ability damage by 5%.',
    row: 0, col: 0,
  },
  {
    id: 'off_lethal_blows', tree: 'spec', specId: 'offense', kind: 'passive', maxRank: 1,
    effect: { stats: { crit: 0.05 } },
    icon: '🎯', name: 'Lethal Blows', description: 'Increases critical strike chance by 5%.',
    row: 0, col: 2,
  },
  {
    id: 'off_deep_wounds', tree: 'spec', specId: 'offense', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'rend', dmgPct: 0.15 }] },
    icon: '🩸', name: 'Deep Wounds', description: 'Increases Rend damage by 15% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'off_weapon_expertise', tree: 'spec', specId: 'offense', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { ap: 8 } },
    icon: '📈', name: 'Weapon Expertise', description: 'Increases attack power by 8 per rank.',
    row: 1, col: 2,
  },
  {
    id: 'off_cleaving', tree: 'spec', specId: 'offense', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'cleave', dmgPct: 0.12 }] },
    icon: '🌀', name: 'Cleave Mastery', description: 'Increases Cleave damage by 12% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'off_mortal_precision', tree: 'spec', specId: 'offense', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['off_brutality'],
    effect: { ability: [{ ability: 'mortal_strike', dmgPct: 0.12 }] },
    icon: '☠', name: 'Mortal Precision', description: 'Increases Mortal Strike damage by 12% per rank.',
    row: 3, col: 1,
  },
];

const DEFENSE_NODES: TalentNode[] = [
  {
    id: 'def_iron_skin', tree: 'spec', specId: 'defense', kind: 'passive', maxRank: 1,
    effect: { stats: { armorPct: 0.10 } },
    icon: '🛡', name: 'Iron Skin', description: 'Increases armor by 10%.',
    row: 0, col: 0,
  },
  {
    id: 'def_vitality', tree: 'spec', specId: 'defense', kind: 'passive', maxRank: 1,
    effect: { stats: { maxHpPct: 0.05 } },
    icon: '♥', name: 'Vitality', description: 'Increases maximum health by 5%.',
    row: 0, col: 2,
  },
  {
    id: 'def_toughness', tree: 'spec', specId: 'defense', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { armorPct: 0.04 } },
    icon: '#', name: 'Toughness', description: 'Increases armor by 4% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'def_deflection', tree: 'spec', specId: 'defense', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { dodge: 0.01 } },
    icon: '🤺', name: 'Deflection', description: 'Increases dodge chance by 1% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'def_shield_training', tree: 'spec', specId: 'defense', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'shield_slam', dmgPct: 0.10 }], global: { threatPct: 0.08 } },
    icon: '💠', name: 'Shield Training', description: 'Increases Shield Slam damage by 10% and threat by 8% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'def_guardian', tree: 'spec', specId: 'defense', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['def_vitality'],
    effect: { stats: { maxHpPct: 0.04, sta: 3 } },
    icon: '💚', name: 'Guardian', description: 'Increases maximum health by 4% and Stamina by 3 per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'offense', class: 'warrior', name: 'Offense', role: 'dps', icon: '⚔',
    description: 'A damage-focused fighter who hits harder and crits more often.',
    signature: 'mortal_strike',
    mastery: { name: 'Warlord\'s Fury', description: 'Increases melee ability damage by 8%.', effect: { global: { meleeDmgPct: 0.08 } } },
  },
  {
    id: 'defense', class: 'warrior', name: 'Defense', role: 'tank', icon: '🛡',
    description: 'A durable defender who absorbs punishment and holds the line.',
    signature: 'shield_slam',
    mastery: { name: 'Guardian\'s Resolve', description: 'Increases armor by 8% and maximum health by 5%.', effect: { stats: { armorPct: 0.08, maxHpPct: 0.05 } } },
  },
];

export const WARRIOR_TALENTS: ClassTalents = {
  class: 'warrior',
  nodes: [...CLASS_NODES, ...OFFENSE_NODES, ...DEFENSE_NODES],
  specs: SPECS,
};
