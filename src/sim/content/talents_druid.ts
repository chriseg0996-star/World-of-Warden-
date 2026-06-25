// ---------------------------------------------------------------------------
// Druid talent content — Balance vs Feral identity. Simple trees tuned for the
// level-5 unlock: two level-10 druids can diverge clearly on ranged nature magic
// vs bear-form tanking without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'dru_natures_grasp', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { ability: [{ ability: 'entangling_roots', costPct: -0.06 }], stats: { spi: 1 } },
    icon: 'v', name: 'Nature Grasp', description: 'Reduces Entangling Roots cost and increases Spirit per rank.',
    row: 0, col: 0,
  },
  {
    id: 'dru_feral_aggression', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { ability: [{ ability: 'maul', dmgPct: 0.05 }, { ability: 'claw', dmgPct: 0.05 }] },
    icon: 'x', name: 'Feral Aggression', description: 'Increases Maul and Claw damage by 5% per rank.',
    row: 0, col: 2,
  },
  {
    id: 'dru_imp_mark', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['dru_natures_grasp'],
    effect: { ability: [{ ability: 'mark_of_the_wild', dmgPct: 0.20 }], stats: { armorPct: 0.03 } },
    icon: '+', name: 'Improved Mark of the Wild', description: 'Strengthens Mark of the Wild and armor per rank.',
    row: 1, col: 0,
  },
  {
    id: 'dru_thick_hide', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['dru_feral_aggression'],
    effect: { stats: { armorPct: 0.04 } },
    icon: '#', name: 'Thick Hide', description: 'Increases armor by 4% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'dru_natures_path', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'dru_path_balance', name: 'Moonglow', icon: '*', description: 'Increases spell damage by 6%.', effect: { global: { spellDmgPct: 0.06 } } },
      { id: 'dru_path_feral', name: 'Heart of the Wild', icon: 'x', description: 'Increases Stamina and attack power.', effect: { stats: { staPct: 0.06, apPct: 0.06 } } },
    ],
    icon: '⬡', name: 'Nature Path', description: 'Choose an emphasis for your path.',
    row: 2, col: 1,
  },
];

const BALANCE_NODES: TalentNode[] = [
  {
    id: 'bal_imp_wrath', tree: 'spec', specId: 'balance', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'wrath', castPct: -0.08, dmgPct: 0.08 }] },
    icon: '*', name: 'Improved Wrath', description: 'Makes Wrath faster and stronger.',
    row: 0, col: 0,
  },
  {
    id: 'bal_imp_moonfire', tree: 'spec', specId: 'balance', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'moonfire', dmgPct: 0.08 }] },
    icon: '*', name: 'Improved Moonfire', description: 'Increases Moonfire damage by 8%.',
    row: 0, col: 2,
  },
  {
    id: 'bal_natures_reach', tree: 'spec', specId: 'balance', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'entangling_roots', castPct: -0.12 }, { ability: 'starfire', castPct: -0.08 }] },
    icon: '>', name: 'Nature Reach', description: 'Improves root and Starfire cast flow per rank.',
    row: 1, col: 0,
  },
  {
    id: 'bal_vengeance', tree: 'spec', specId: 'balance', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { crit: 0.02 } },
    icon: 'x', name: 'Vengeance', description: 'Increases critical strike chance by 2% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'bal_moonglow', tree: 'spec', specId: 'balance', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { global: { spellDmgPct: 0.05 } },
    icon: '*', name: 'Moonglow', description: 'Increases spell damage by 5% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'bal_starfire_mastery', tree: 'spec', specId: 'balance', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['bal_imp_wrath'],
    effect: { ability: [{ ability: 'starfire', dmgPct: 0.12, castPct: -0.08 }] },
    icon: '*', name: 'Starfire Mastery', description: 'Improves Starfire damage and cast speed per rank.',
    row: 3, col: 1,
  },
];

const FERAL_NODES: TalentNode[] = [
  {
    id: 'feral_thick_hide', tree: 'spec', specId: 'feral', kind: 'passive', maxRank: 1,
    effect: { stats: { armorPct: 0.10 } },
    icon: '#', name: 'Thick Hide', description: 'Increases armor by 10%.',
    row: 0, col: 0,
  },
  {
    id: 'feral_ferocity', tree: 'spec', specId: 'feral', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'maul', costPct: -0.08 }] },
    icon: 'v', name: 'Ferocity', description: 'Reduces Maul cost by 8%.',
    row: 0, col: 2,
  },
  {
    id: 'feral_brutal_impact', tree: 'spec', specId: 'feral', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'maul', dmgPct: 0.10 }, { ability: 'swipe', dmgPct: 0.10 }] },
    icon: 'x', name: 'Brutal Impact', description: 'Increases bear attack damage per rank.',
    row: 1, col: 0,
  },
  {
    id: 'feral_feline_swiftness', tree: 'spec', specId: 'feral', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { dodge: 0.02, agi: 2 } },
    icon: '>', name: 'Feline Swiftness', description: 'Increases dodge and Agility per rank.',
    row: 1, col: 2,
  },
  {
    id: 'feral_dire_bear', tree: 'spec', specId: 'feral', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { stats: { armorPct: 0.06 }, global: { threatPct: 0.08 } },
    icon: '#', name: 'Dire Bear', description: 'Increases armor and threat per rank.',
    row: 2, col: 0,
  },
  {
    id: 'feral_heart_wild', tree: 'spec', specId: 'feral', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['feral_thick_hide'],
    effect: { stats: { staPct: 0.05, apPct: 0.05 }, global: { threatPct: 0.05 } },
    icon: 'x', name: 'Heart of the Wild', description: 'Improves Stamina, attack power, and threat per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'balance', class: 'druid', name: 'Balance', role: 'dps', icon: '*',
    description: 'A caster who uses lunar and nature magic from range.',
    signature: 'starfire',
    mastery: { name: 'Moonfury', description: 'Increases spell damage and Intellect.', effect: { global: { spellDmgPct: 0.10 }, stats: { int: 4 } } },
  },
  {
    id: 'feral', class: 'druid', name: 'Feral', role: 'tank', icon: 'x',
    description: 'A shapeshifter who tanks in bear form and fights up close.',
    signature: 'bear_form',
    mastery: { name: 'Heart of the Wild', description: 'Increases threat, armor, and attack power.', effect: { global: { threatPct: 0.20, meleeDmgPct: 0.06 }, stats: { armorPct: 0.08 } } },
  },
];

export const DRUID_TALENTS: ClassTalents = {
  class: 'druid',
  nodes: [...CLASS_NODES, ...BALANCE_NODES, ...FERAL_NODES],
  specs: SPECS,
};
