// ---------------------------------------------------------------------------
// Warlock talent content — Affliction vs Destruction identity. Simple trees
// tuned for the level-5 unlock: two level-10 warlocks can diverge clearly on
// damage over time vs burst casting without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'wlk_suppression', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { ability: [{ ability: 'corruption', costPct: -0.05 }, { ability: 'curse_of_agony', costPct: -0.05 }] },
    icon: 'v', name: 'Suppression', description: 'Reduces Affliction spell costs by 5% per rank.',
    row: 0, col: 0,
  },
  {
    id: 'wlk_demonic_embrace', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { sta: 2 } },
    icon: '+', name: 'Demonic Embrace', description: 'Increases Stamina by 2 per rank.',
    row: 0, col: 2,
  },
  {
    id: 'wlk_imp_corruption', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['wlk_suppression'],
    effect: { ability: [{ ability: 'corruption', castPct: -0.35, dmgPct: 0.05 }] },
    icon: '*', name: 'Improved Corruption', description: 'Makes Corruption faster and stronger per rank.',
    row: 1, col: 0,
  },
  {
    id: 'wlk_demonic_skin', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['wlk_demonic_embrace'],
    effect: { ability: [{ ability: 'demon_skin', dmgPct: 0.20 }], stats: { armorPct: 0.03 } },
    icon: '#', name: 'Improved Demon Skin', description: 'Strengthens Demon Skin and armor per rank.',
    row: 1, col: 2,
  },
  {
    id: 'wlk_dark_pact', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'wlk_pact_affliction', name: 'Nightfall', icon: '*', description: 'Increases Shadow damage by 6%.', effect: { global: { spellDmgPct: 0.06 } } },
      { id: 'wlk_pact_destruction', name: 'Devastation', icon: 'x', description: 'Increases critical strike by 4%.', effect: { stats: { crit: 0.04 } } },
    ],
    icon: '⬡', name: 'Dark Pact', description: 'Choose an emphasis for your pact.',
    row: 2, col: 1,
  },
];

const AFFLICTION_NODES: TalentNode[] = [
  {
    id: 'aff_imp_corruption', tree: 'spec', specId: 'affliction', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'corruption', dmgPct: 0.08 }] },
    icon: '*', name: 'Improved Corruption', description: 'Increases Corruption damage by 8%.',
    row: 0, col: 0,
  },
  {
    id: 'aff_imp_agony', tree: 'spec', specId: 'affliction', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'curse_of_agony', dmgPct: 0.08 }] },
    icon: '*', name: 'Improved Curse of Agony', description: 'Increases Curse of Agony damage by 8%.',
    row: 0, col: 2,
  },
  {
    id: 'aff_fel_concentration', tree: 'spec', specId: 'affliction', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'drain_life', dmgPct: 0.12, costPct: -0.08 }] },
    icon: '+', name: 'Fel Concentration', description: 'Improves Drain Life damage and cost per rank.',
    row: 1, col: 0,
  },
  {
    id: 'aff_amplify_curse', tree: 'spec', specId: 'affliction', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'curse_of_agony', cooldownPct: -0.10, dmgPct: 0.10 }] },
    icon: '*', name: 'Amplify Curse', description: 'Improves Curse of Agony pressure per rank.',
    row: 1, col: 2,
  },
  {
    id: 'aff_unstable_affliction', tree: 'spec', specId: 'affliction', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'corruption', dmgPct: 0.10 }, { ability: 'curse_of_agony', dmgPct: 0.10 }] },
    icon: '*', name: 'Unstable Affliction', description: 'Increases DoT damage per rank.',
    row: 2, col: 0,
  },
  {
    id: 'aff_shadow_mastery', tree: 'spec', specId: 'affliction', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['aff_imp_corruption'],
    effect: { global: { spellDmgPct: 0.06 }, stats: { spi: 2 } },
    icon: '*', name: 'Shadow Mastery', description: 'Increases spell damage and Spirit per rank.',
    row: 3, col: 1,
  },
];

const DESTRUCTION_NODES: TalentNode[] = [
  {
    id: 'dest_cataclysm', tree: 'spec', specId: 'destruction', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'shadow_bolt', costPct: -0.05 }, { ability: 'immolate', costPct: -0.05 }] },
    icon: 'v', name: 'Cataclysm', description: 'Reduces destructive spell costs by 5%.',
    row: 0, col: 0,
  },
  {
    id: 'dest_bane', tree: 'spec', specId: 'destruction', kind: 'passive', maxRank: 1,
    effect: { ability: [{ ability: 'shadow_bolt', castPct: -0.08 }, { ability: 'immolate', castPct: -0.08 }] },
    icon: '>', name: 'Bane', description: 'Reduces Shadow Bolt and Immolate cast times.',
    row: 0, col: 2,
  },
  {
    id: 'dest_devastation', tree: 'spec', specId: 'destruction', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { crit: 0.02 } },
    icon: 'x', name: 'Devastation', description: 'Increases critical strike chance by 2% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'dest_imp_searing', tree: 'spec', specId: 'destruction', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'searing_pain', dmgPct: 0.14 }] },
    icon: 'x', name: 'Improved Searing Pain', description: 'Increases Searing Pain damage by 14% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'dest_emberstorm', tree: 'spec', specId: 'destruction', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'immolate', dmgPct: 0.12 }, { ability: 'searing_pain', dmgPct: 0.12 }] },
    icon: 'x', name: 'Emberstorm', description: 'Increases Fire spell damage per rank.',
    row: 2, col: 0,
  },
  {
    id: 'dest_backdraft', tree: 'spec', specId: 'destruction', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['dest_cataclysm'],
    effect: { global: { spellDmgPct: 0.06 }, ability: [{ ability: 'shadowburn', cooldownPct: -0.10 }] },
    icon: 'x', name: 'Backdraft', description: 'Increases spell damage and improves Shadowburn per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'affliction', class: 'warlock', name: 'Affliction', role: 'dps', icon: '*',
    description: 'A curse-weaver using damage over time and drains.',
    signature: 'drain_life',
    mastery: { name: 'Potent Afflictions', description: 'Increases Shadow spell damage by 12%.', effect: { global: { spellDmgPct: 0.12 } } },
  },
  {
    id: 'destruction', class: 'warlock', name: 'Destruction', role: 'dps', icon: 'x',
    description: 'A burst caster using Shadow Bolt, fire, and Shadowburn.',
    signature: 'shadowburn',
    mastery: { name: 'Ruin', description: 'Increases spell damage and critical strike chance.', effect: { global: { spellDmgPct: 0.10 }, stats: { crit: 0.02 } } },
  },
];

export const WARLOCK_TALENTS: ClassTalents = {
  class: 'warlock',
  nodes: [...CLASS_NODES, ...AFFLICTION_NODES, ...DESTRUCTION_NODES],
  specs: SPECS,
};
