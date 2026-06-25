// ---------------------------------------------------------------------------
// Priest talent content — Holy vs Shadow identity. Simple trees tuned for the
// level-5 unlock: two level-10 priests can diverge clearly on healing vs shadow
// damage without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'pri_wand_specialization', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { int: 2 } },
    icon: '/', name: 'Wand Specialization', description: 'Increases Intellect by 2 per rank.',
    row: 0, col: 0,
  },
  {
    id: 'pri_spirit_tap', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { spi: 2 } },
    icon: '*', name: 'Spirit Tap', description: 'Increases Spirit by 2 per rank.',
    row: 0, col: 2,
  },
  {
    id: 'pri_imp_fortitude', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['pri_wand_specialization'],
    effect: { ability: [{ ability: 'power_word_fortitude', dmgPct: 0.20 }], stats: { sta: 2 } },
    icon: '+', name: 'Improved Fortitude', description: 'Increases Stamina by 2 and strengthens Fortitude per rank.',
    row: 1, col: 0,
  },
  {
    id: 'pri_meditation', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['pri_spirit_tap'],
    effect: { ability: [{ ability: 'lesser_heal', costPct: -0.08 }, { ability: 'heal', costPct: -0.08 }, { ability: 'flash_heal', costPct: -0.08 }] },
    icon: 'v', name: 'Meditation', description: 'Reduces healing spell costs by 8% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'pri_inner_calling', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'pri_calling_holy', name: 'Divine Fury', icon: '+', description: 'Increases healing by 6%.', effect: { global: { healPct: 0.06 } } },
      { id: 'pri_calling_shadow', name: 'Darkness', icon: '*', description: 'Increases spell damage by 6%.', effect: { global: { spellDmgPct: 0.06 } } },
    ],
    icon: '⬡', name: 'Inner Calling', description: 'Choose an emphasis for your calling.',
    row: 2, col: 1,
  },
];

const HOLY_NODES: TalentNode[] = [
  {
    id: 'holy_healing_focus', tree: 'spec', specId: 'holy', kind: 'passive', maxRank: 1,
    effect: { global: { healPct: 0.05 } },
    icon: '+', name: 'Healing Focus', description: 'Increases healing done by 5%.',
    row: 0, col: 0,
  },
  {
    id: 'holy_twin_disciplines', tree: 'spec', specId: 'holy', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'power_word_shield', dmgPct: 0.08 }] },
    icon: '#', name: 'Twin Disciplines', description: 'Increases Power Word: Shield absorption by 8%.',
    row: 0, col: 2,
  },
  {
    id: 'holy_renewal', tree: 'spec', specId: 'holy', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'renew', dmgPct: 0.08 }] },
    icon: '+', name: 'Improved Renew', description: 'Increases Renew healing by 8% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'holy_divine_fury', tree: 'spec', specId: 'holy', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'heal', castPct: -0.10 }, { ability: 'flash_heal', castPct: -0.08 }] },
    icon: '>', name: 'Divine Fury', description: 'Makes direct heals faster per rank.',
    row: 1, col: 2,
  },
  {
    id: 'holy_inspiration', tree: 'spec', specId: 'holy', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { stats: { armorPct: 0.05 }, global: { healPct: 0.03 } },
    icon: '#', name: 'Inspiration', description: 'Increases armor and healing per rank.',
    row: 2, col: 0,
  },
  {
    id: 'holy_spiritual_healing', tree: 'spec', specId: 'holy', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['holy_healing_focus'],
    effect: { global: { healPct: 0.07 }, stats: { crit: 0.02 } },
    icon: '+', name: 'Spiritual Healing', description: 'Increases healing and critical strike per rank.',
    row: 3, col: 1,
  },
];

const SHADOW_NODES: TalentNode[] = [
  {
    id: 'shadow_blackout', tree: 'spec', specId: 'shadow', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'mind_blast', dmgPct: 0.08 }] },
    icon: '*', name: 'Blackout', description: 'Increases Mind Blast damage by 8%.',
    row: 0, col: 0,
  },
  {
    id: 'shadow_word_pain', tree: 'spec', specId: 'shadow', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'shadow_word_pain', dmgPct: 0.08 }] },
    icon: '*', name: 'Improved Shadow Word: Pain', description: 'Increases Shadow Word: Pain damage by 8%.',
    row: 0, col: 2,
  },
  {
    id: 'shadow_mind_flay', tree: 'spec', specId: 'shadow', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'mind_flay', dmgPct: 0.12, costPct: -0.08 }] },
    icon: '*', name: 'Improved Mind Flay', description: 'Improves Mind Flay damage and cost per rank.',
    row: 1, col: 0,
  },
  {
    id: 'shadow_focus', tree: 'spec', specId: 'shadow', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { global: { spellDmgPct: 0.05 } },
    icon: 'x', name: 'Shadow Focus', description: 'Increases spell damage by 5% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'shadow_darkness', tree: 'spec', specId: 'shadow', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'shadow_word_pain', dmgPct: 0.10 }] },
    icon: '*', name: 'Darkness', description: 'Increases Shadow Word: Pain damage by 10% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'shadow_shadowform', tree: 'spec', specId: 'shadow', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['shadow_blackout'],
    effect: { global: { spellDmgPct: 0.06 }, stats: { armorPct: 0.05 } },
    icon: '*', name: 'Shadowform', description: 'Increases spell damage and armor per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'holy', class: 'priest', name: 'Holy', role: 'healer', icon: '+',
    description: 'A direct healer with strong throughput and restorative prayers.',
    signature: 'flash_heal',
    mastery: { name: 'Spiritual Healing', description: 'Increases all healing done by 14%.', effect: { global: { healPct: 0.14 } } },
  },
  {
    id: 'shadow', class: 'priest', name: 'Shadow', role: 'dps', icon: '*',
    description: 'A damage caster built around Shadow damage over time and mind spells.',
    signature: 'mind_flay',
    mastery: { name: 'Shadowform', description: 'Increases spell damage by 12% and armor by 8%.', effect: { global: { spellDmgPct: 0.12 }, stats: { armorPct: 0.08 } } },
  },
];

export const PRIEST_TALENTS: ClassTalents = {
  class: 'priest',
  nodes: [...CLASS_NODES, ...HOLY_NODES, ...SHADOW_NODES],
  specs: SPECS,
};
