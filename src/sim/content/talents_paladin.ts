// ---------------------------------------------------------------------------
// Paladin talent content — Protection vs Retribution identity. Simple trees
// tuned for the level-5 unlock: two level-10 paladins can diverge clearly on
// tanking and survivability vs holy burst damage without a large prerequisite web.
// ---------------------------------------------------------------------------

import type { ClassTalents, SpecDef, TalentNode } from './talents';

const CLASS_NODES: TalentNode[] = [
  {
    id: 'pal_divine_strength', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { str: 2 } },
    icon: '+', name: 'Divine Strength', description: 'Increases Strength by 2 per rank.',
    row: 0, col: 0,
  },
  {
    id: 'pal_spiritual_focus', tree: 'class', kind: 'passive', maxRank: 2,
    effect: { stats: { spi: 2 }, global: { healPct: 0.02 } },
    icon: '*', name: 'Spiritual Focus', description: 'Increases Spirit by 2 and healing done by 2% per rank.',
    row: 0, col: 2,
  },
  {
    id: 'pal_imp_devotion_aura', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['pal_divine_strength'],
    effect: { ability: [{ ability: 'devotion_aura', dmgPct: 0.20 }], stats: { armorPct: 0.03 } },
    icon: '#', name: 'Improved Devotion Aura', description: 'Increases armor by 3% per rank and strengthens Devotion Aura.',
    row: 1, col: 0,
  },
  {
    id: 'pal_benediction', tree: 'class', kind: 'passive', maxRank: 2,
    requires: ['pal_spiritual_focus'],
    effect: { ability: [{ ability: 'seal_of_righteousness', costPct: -0.08 }, { ability: 'judgement', costPct: -0.08 }] },
    icon: 'v', name: 'Benediction', description: 'Reduces the mana cost of Seal of Righteousness and Judgement by 8% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'pal_holy_calling', tree: 'class', kind: 'choice', maxRank: 1, pointsGate: 3,
    choices: [
      { id: 'pal_calling_guardian', name: 'Guardian Favor', icon: '#', description: 'Increases armor by 8% and dodge by 2%.', effect: { stats: { armorPct: 0.08, dodge: 0.02 } } },
      { id: 'pal_calling_crusader', name: 'Crusader Zeal', icon: 'x', description: 'Increases melee ability damage by 6%.', effect: { global: { meleeDmgPct: 0.06 } } },
    ],
    icon: '⬡', name: 'Holy Calling', description: 'Choose an emphasis for your calling.',
    row: 2, col: 1,
  },
];

const PROTECTION_NODES: TalentNode[] = [
  {
    id: 'prot_redoubt', tree: 'spec', specId: 'protection', kind: 'passive', maxRank: 1,
    effect: { stats: { armorPct: 0.10 } },
    icon: '#', name: 'Redoubt', description: 'Increases armor by 10%.',
    row: 0, col: 0,
  },
  {
    id: 'prot_vitality', tree: 'spec', specId: 'protection', kind: 'passive', maxRank: 1,
    effect: { stats: { maxHpPct: 0.05 } },
    icon: '+', name: 'Vitality', description: 'Increases maximum health by 5%.',
    row: 0, col: 2,
  },
  {
    id: 'prot_toughness', tree: 'spec', specId: 'protection', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { armorPct: 0.04 } },
    icon: '#', name: 'Toughness', description: 'Increases armor by 4% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'prot_deflection', tree: 'spec', specId: 'protection', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { stats: { dodge: 0.01 } },
    icon: 'o', name: 'Deflection', description: 'Increases dodge chance by 1% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'prot_guardians_favor', tree: 'spec', specId: 'protection', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { ability: [{ ability: 'divine_protection', cooldownPct: -0.15 }, { ability: 'hammer_of_justice', cooldownPct: -0.10 }] },
    icon: 'O', name: 'Guardian Favor', description: 'Reduces defensive cooldowns by 10-15% per rank.',
    row: 2, col: 0,
  },
  {
    id: 'prot_guardian', tree: 'spec', specId: 'protection', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['prot_vitality'],
    effect: { stats: { maxHpPct: 0.04, sta: 3 }, global: { threatPct: 0.08 } },
    icon: '#', name: 'Guardian', description: 'Increases maximum health, Stamina, and threat per rank.',
    row: 3, col: 1,
  },
];

const RETRIBUTION_NODES: TalentNode[] = [
  {
    id: 'ret_conviction', tree: 'spec', specId: 'retribution', kind: 'passive', maxRank: 1,
    effect: { stats: { crit: 0.05 } },
    icon: 'x', name: 'Conviction', description: 'Increases critical strike chance by 5%.',
    row: 0, col: 0,
  },
  {
    id: 'ret_seal_command', tree: 'spec', specId: 'retribution', kind: 'passive', maxRank: 2,
    effect: { ability: [{ ability: 'seal_of_righteousness', dmgPct: 0.20 }] },
    icon: 'x', name: 'Seal Command', description: 'Increases Seal of Righteousness damage by 20% per rank.',
    row: 0, col: 2,
  },
  {
    id: 'ret_imp_judgement', tree: 'spec', specId: 'retribution', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { ability: [{ ability: 'judgement', cooldownPct: -0.15, dmgPct: 0.10 }] },
    icon: '!', name: 'Improved Judgement', description: 'Reduces Judgement cooldown by 15% and increases damage by 10% per rank.',
    row: 1, col: 0,
  },
  {
    id: 'ret_zeal', tree: 'spec', specId: 'retribution', kind: 'passive', maxRank: 2, pointsGate: 2,
    effect: { global: { meleeDmgPct: 0.05 } },
    icon: 'x', name: 'Zeal', description: 'Increases melee ability damage by 5% per rank.',
    row: 1, col: 2,
  },
  {
    id: 'ret_crusader_strikes', tree: 'spec', specId: 'retribution', kind: 'passive', maxRank: 2, pointsGate: 4,
    effect: { global: { spellDmgPct: 0.04 }, ability: [{ ability: 'exorcism', cooldownPct: -0.10 }] },
    icon: 'x', name: 'Crusader Strikes', description: 'Increases spell damage and reduces Exorcism cooldown per rank.',
    row: 2, col: 0,
  },
  {
    id: 'ret_vengeance', tree: 'spec', specId: 'retribution', kind: 'passive', maxRank: 2, pointsGate: 6,
    requires: ['ret_conviction'],
    effect: { global: { meleeDmgPct: 0.04, spellDmgPct: 0.04 }, stats: { crit: 0.02 } },
    icon: 'x', name: 'Vengeance', description: 'Increases offensive damage and critical strike per rank.',
    row: 3, col: 1,
  },
];

const SPECS: SpecDef[] = [
  {
    id: 'protection', class: 'paladin', name: 'Protection', role: 'tank', icon: '#',
    description: 'A shield-bearing defender who converts Holy power into threat and mitigation.',
    signature: 'righteous_fury',
    mastery: { name: 'Holy Shielding', description: 'Increases threat by 25% and armor by 10%.', effect: { global: { threatPct: 0.25 }, stats: { armorPct: 0.10 } } },
  },
  {
    id: 'retribution', class: 'paladin', name: 'Retribution', role: 'dps', icon: 'x',
    description: 'A holy warrior who judges enemies with weapon strikes and radiant burst.',
    signature: 'judgement',
    mastery: { name: 'Vengeance', description: 'Increases melee and spell ability damage by 6%.', effect: { global: { meleeDmgPct: 0.06, spellDmgPct: 0.06 } } },
  },
];

export const PALADIN_TALENTS: ClassTalents = {
  class: 'paladin',
  nodes: [...CLASS_NODES, ...PROTECTION_NODES, ...RETRIBUTION_NODES],
  specs: SPECS,
};
