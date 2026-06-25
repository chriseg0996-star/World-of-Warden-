// ---------------------------------------------------------------------------
// Rogue talent content — Assassination vs Combat identity. Simple trees tuned
// for the level-5 unlock: two level-10 rogues can diverge clearly on burst
// finishers vs sustained weapon strikes without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'rog_deadly_precision', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { agi: 2 } },
    icon: 'x', name: 'Deadly Precision', description: 'Increases Agility by 2 per rank.',
    row: 0, col: 0,
  },
  {
    id: 'rog_quick_reflexes', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { dodge: 0.01 } },
    icon: 'o', name: 'Quick Reflexes', description: 'Increases dodge chance by 1% per rank.',
    row: 0, col: 2,
  },
  {
    id: 'rog_improved_sinister', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['rog_deadly_precision'],
    effect: { ability: [{ ability: 'sinister_strike', dmgPct: 0.10 }] },
    icon: '/', name: 'Improved Sinister Strike', description: 'Increases Sinister Strike damage by 10% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'rog_improved_gouge', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['rog_quick_reflexes'],
    effect: { ability: [{ ability: 'gouge', cooldownPct: -0.10, dmgPct: 0.08 }] },
    icon: 'o', name: 'Improved Gouge', description: 'Improves Gouge cooldown and damage per rank.',
    row: 1, col: 2,
  },
  {
    id: 'rog_fighting_style', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'rog_style_finishers', name: 'Deadly Finish', icon: 'x', description: 'Increases finisher damage by 4%.', effect: { ability: [{ ability: 'eviscerate', dmgPct: 0.04 }] } },
      { id: 'rog_style_blades', name: 'Blade Flurry', icon: '/', description: 'Increases melee ability damage by 4%.', effect: { global: { meleeDmgPct: 0.04 } } },
    ],
    icon: '⬡', name: 'Fighting Style', description: 'Choose an emphasis for your fighting style.',
    row: 2, col: 1,
  },
];

const ASSASSINATION_NODES: TalentNode[] = [
  {
    id: 'ass_deadliness', tree: 'spec', specId: 'assassination', kind: 'passive', maxRank: 1,
    effect: { stats: { crit: 0.05 } },
    icon: 'x', name: 'Deadliness', description: 'Increases critical strike chance by 5%.',
    row: 0, col: 0,
  },
  {
    id: 'ass_ruthlessness', tree: 'spec', specId: 'assassination', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'eviscerate', dmgPct: 0.08 }] },
    icon: '🎯', name: 'Ruthlessness', description: 'Increases Eviscerate damage by 8%.',
    row: 0, col: 2,
  },
  {
    id: 'ass_lethality', tree: 'spec', specId: 'assassination', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { global: { meleeDmgPct: 0.05 } },
    icon: 'x', name: 'Lethality', description: 'Increases melee ability damage by 5% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'ass_finishing_moves', tree: 'spec', specId: 'assassination', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'slice_and_dice', costPct: -0.10 }, { ability: 'kidney_shot', costPct: -0.10 }] },
    icon: 'v', name: 'Finishing Moves', description: 'Reduces finisher costs by 10% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'ass_vile_precision', tree: 'spec', specId: 'assassination', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'eviscerate', dmgPct: 0.12 }] },
    icon: 'x', name: 'Vile Precision', description: 'Increases Eviscerate damage by 12% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'ass_murderous_finish', tree: 'spec', specId: 'assassination', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['ass_deadliness'],
    effect: { ability: [{ ability: 'eviscerate', dmgPct: 0.10 }], stats: { crit: 0.02 } },
    icon: '☠', name: 'Murderous Finish', description: 'Improves Eviscerate damage and critical strike per rank.',
    row: 3, col: 1,
  },
];

const COMBAT_NODES: TalentNode[] = [
  {
    id: 'com_blade_work', tree: 'spec', specId: 'combat', kind: 'passive', maxRank: 1,
    effect: { global: { meleeDmgPct: 0.05 } },
    icon: '/', name: 'Blade Work', description: 'Increases melee ability damage by 5%.',
    row: 0, col: 0,
  },
  {
    id: 'com_weapon_skill', tree: 'spec', specId: 'combat', kind: 'passive', maxRank: 1,
    effect: { stats: { ap: 10 } },
    icon: '📈', name: 'Weapon Skill', description: 'Increases attack power by 10.',
    row: 0, col: 2,
  },
  {
    id: 'com_precision', tree: 'spec', specId: 'combat', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'sinister_strike', dmgPct: 0.12 }] },
    icon: '/', name: 'Precision', description: 'Increases Sinister Strike damage by 12% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'com_ruthless_efficiency', tree: 'spec', specId: 'combat', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'sinister_strike', costPct: -0.08 }] },
    icon: 'v', name: 'Ruthless Efficiency', description: 'Reduces Sinister Strike cost by 8% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'com_weapon_expertise', tree: 'spec', specId: 'combat', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { stats: { apPct: 0.06 } },
    icon: '/', name: 'Weapon Expertise', description: 'Increases attack power by 6% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'com_adrenaline_focus', tree: 'spec', specId: 'combat', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['com_blade_work'],
    effect: { ability: [{ ability: 'adrenaline_rush', cooldownPct: -0.15 }], global: { meleeDmgPct: 0.04 } },
    icon: '>', name: 'Adrenaline Focus', description: 'Improves Adrenaline Rush and melee damage per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'assassination', class: 'rogue', name: 'Assassination', role: 'dps', icon: 'x',
    description: 'A burst specialist who spends combo points on lethal finishers.',
    signature: 'eviscerate',
    mastery: { name: 'Murderous Intent', description: 'Increases critical strike chance by 3% and Eviscerate damage by 8%.', effect: { stats: { crit: 0.03 }, ability: [{ ability: 'eviscerate', dmgPct: 0.08 }] } },
  },
  {
    id: 'combat', class: 'rogue', name: 'Combat', role: 'dps', icon: '/',
    description: 'A sustained fighter who wins long trades with weapon strikes and tempo.',
    signature: 'adrenaline_rush',
    mastery: { name: 'Combat Potency', description: 'Increases melee ability damage by 10%.', effect: { global: { meleeDmgPct: 0.10 } } },
  },
];

export const ROGUE_TALENTS: ClassTalents = {
  class: 'rogue',
  nodes: [...CLASS_NODES, ...ASSASSINATION_NODES, ...COMBAT_NODES],
  specs: SPECS,
};
