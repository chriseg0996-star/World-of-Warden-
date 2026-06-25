// ---------------------------------------------------------------------------
// Hunter talent content — Beast Mastery vs Marksmanship identity. Simple trees
// tuned for the level-5 unlock: two level-10 hunters can diverge clearly on
// pet synergy vs precision shooting without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'hun_endurance_training', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { sta: 2 } },
    icon: '+', name: 'Endurance Training', description: 'Increases Stamina by 2 per rank.',
    row: 0, col: 0,
  },
  {
    id: 'hun_lethal_shots', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { crit: 0.01 } },
    icon: 'x', name: 'Lethal Shots', description: 'Increases critical strike chance by 1% per rank.',
    row: 0, col: 2,
  },
  {
    id: 'hun_imp_hawk', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['hun_endurance_training'],
    effect: { ability: [{ ability: 'aspect_of_the_hawk', dmgPct: 0.20 }], stats: { ap: 8 } },
    icon: '^', name: 'Improved Aspect of the Hawk', description: 'Increases attack power by 8 and strengthens Aspect of the Hawk per rank.',
    row: 1, col: 0,
  },
  {
    id: 'hun_efficiency', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['hun_lethal_shots'],
    effect: { ability: [{ ability: 'arcane_shot', costPct: -0.08 }, { ability: 'serpent_sting', costPct: -0.08 }] },
    icon: 'v', name: 'Efficiency', description: 'Reduces shot and sting costs by 8% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'hun_pathfinder', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'hun_path_beast', name: 'Pack Leader', icon: '+', description: 'Increases maximum health by 8%.', effect: { stats: { maxHpPct: 0.08 } } },
      { id: 'hun_path_marksman', name: 'Hawk Eye', icon: 'x', description: 'Increases ranged attack power by 12%.', effect: { stats: { apPct: 0.12 } } },
    ],
    icon: '⬡', name: 'Pathfinder', description: 'Choose an emphasis for your hunting style.',
    row: 2, col: 1,
  },
];

const BEAST_MASTERY_NODES: TalentNode[] = [
  {
    id: 'bm_thick_hide', tree: 'spec', specId: 'beast_mastery', kind: 'passive', maxRank: 1,
    effect: { stats: { armorPct: 0.10 } },
    icon: '#', name: 'Thick Hide', description: 'Increases armor by 10%.',
    row: 0, col: 0,
  },
  {
    id: 'bm_unleashed_fury', tree: 'spec', specId: 'beast_mastery', kind: 'passive', maxRank: 1,
    effect: { stats: { ap: 10 } },
    icon: 'x', name: 'Unleashed Fury', description: 'Increases attack power by 10.',
    row: 0, col: 2,
  },
  {
    id: 'bm_ferocity', tree: 'spec', specId: 'beast_mastery', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { crit: 0.02 } },
    icon: 'x', name: 'Ferocity', description: 'Increases critical strike chance by 2% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'bm_bestial_bond', tree: 'spec', specId: 'beast_mastery', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { global: { meleeDmgPct: 0.05 } },
    icon: '+', name: 'Bestial Bond', description: 'Increases melee and pet ability damage by 5% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'bm_focused_fire', tree: 'spec', specId: 'beast_mastery', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'rapid_fire', cooldownPct: -0.15 }], stats: { crit: 0.01 } },
    icon: '>', name: 'Focused Fire', description: 'Reduces Rapid Fire cooldown and increases crit per rank.',
    row: 2, col: 0,
  },
  {
    id: 'bm_alpha_predator', tree: 'spec', specId: 'beast_mastery', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['bm_thick_hide'],
    effect: { stats: { apPct: 0.06, maxHpPct: 0.04 } },
    icon: '+', name: 'Alpha Predator', description: 'Increases attack power by 6% and maximum health by 4% per rank.',
    row: 3, col: 1,
  },
];

const MARKSMANSHIP_NODES: TalentNode[] = [
  {
    id: 'mm_imp_arcane_shot', tree: 'spec', specId: 'marksmanship', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'arcane_shot', dmgPct: 0.08 }] },
    icon: '*', name: 'Improved Arcane Shot', description: 'Increases Arcane Shot damage by 8%.',
    row: 0, col: 0,
  },
  {
    id: 'mm_lethal_shots', tree: 'spec', specId: 'marksmanship', kind: 'passive', maxRank: 1,
    effect: { stats: { crit: 0.05 } },
    icon: 'x', name: 'Lethal Shots', description: 'Increases critical strike chance by 5%.',
    row: 0, col: 2,
  },
  {
    id: 'mm_aimed_focus', tree: 'spec', specId: 'marksmanship', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'aimed_shot', castPct: -0.10, dmgPct: 0.08 }] },
    icon: '>', name: 'Aimed Focus', description: 'Makes Aimed Shot faster and stronger per rank.',
    row: 1, col: 0,
  },
  {
    id: 'mm_barrage', tree: 'spec', specId: 'marksmanship', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'arcane_shot', cooldownPct: -0.10 }, { ability: 'concussive_shot', dmgPct: 0.15 }] },
    icon: '*', name: 'Barrage', description: 'Improves instant shots per rank.',
    row: 1, col: 2,
  },
  {
    id: 'mm_trueshot_training', tree: 'spec', specId: 'marksmanship', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { stats: { apPct: 0.06 } },
    icon: '^', name: 'Trueshot Training', description: 'Increases attack power by 6% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'mm_marksman_mastery', tree: 'spec', specId: 'marksmanship', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['mm_imp_arcane_shot'],
    effect: { ability: [{ ability: 'aimed_shot', cooldownPct: -0.12, dmgPct: 0.10 }] },
    icon: 'x', name: 'Marksman Mastery', description: 'Improves Aimed Shot cooldown and damage per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'beast_mastery', class: 'hunter', name: 'Beast Mastery', role: 'dps', icon: '+',
    description: 'A wild commander who fights beside a durable companion.',
    signature: 'tame_beast',
    mastery: { name: 'Kindred Spirits', description: 'Increases maximum health and attack power by 8%.', effect: { stats: { maxHpPct: 0.08, apPct: 0.08 } } },
  },
  {
    id: 'marksmanship', class: 'hunter', name: 'Marksmanship', role: 'dps', icon: 'x',
    description: 'A precise archer built around ranged burst and efficient shots.',
    signature: 'aimed_shot',
    mastery: { name: 'Trueshot Training', description: 'Increases attack power by 12% and critical strike by 2%.', effect: { stats: { apPct: 0.12, crit: 0.02 } } },
  },
];

export const HUNTER_TALENTS: ClassTalents = {
  class: 'hunter',
  nodes: [...CLASS_NODES, ...BEAST_MASTERY_NODES, ...MARKSMANSHIP_NODES],
  specs: SPECS,
};
