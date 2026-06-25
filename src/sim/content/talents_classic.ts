// ---------------------------------------------------------------------------
// Classic-inspired talent content for warlock and druid.
// Warrior, mage, rogue, hunter, paladin, priest, and shaman live in dedicated files.
// ---------------------------------------------------------------------------

import type { PlayerClass } from '../types';
import type { ClassTalents, SpecDef, TalentChoiceOption, TalentEffect, TalentNode, TalentTree, Role } from './talents';

type Gate = Pick<TalentNode, 'requires' | 'pointsGate'>;

function passive(id: string, tree: TalentTree, specId: string | undefined, maxRank: number, effect: TalentEffect, icon: string, name: string, description: string, row: number, col: number, gate: Gate = {}): TalentNode {
  return { id, tree, ...(specId ? { specId } : {}), kind: 'passive', maxRank, effect, icon, name, description, row, col, ...gate };
}

function active(id: string, tree: TalentTree, specId: string | undefined, effect: TalentEffect, icon: string, name: string, description: string, row: number, col: number, gate: Gate = {}): TalentNode {
  return { id, tree, ...(specId ? { specId } : {}), kind: 'active', maxRank: 1, effect, icon, name, description, row, col, ...gate };
}

function choice(id: string, tree: TalentTree, specId: string | undefined, icon: string, name: string, description: string, row: number, col: number, choices: TalentChoiceOption[], gate: Gate = {}): TalentNode {
  return { id, tree, ...(specId ? { specId } : {}), kind: 'choice', maxRank: 1, icon, name, description, row, col, choices, ...gate };
}

function spec(id: string, cls: PlayerClass, name: string, role: Role, icon: string, description: string, signature: string, masteryName: string, masteryDescription: string, effect: TalentEffect): SpecDef {
  return { id, class: cls, name, role, icon, description, signature, mastery: { name: masteryName, description: masteryDescription, effect } };
}

const WARLOCK_CLASS: TalentNode[] = [
  passive('wlk_suppression', 'class', undefined, 3, { ability: [{ ability: 'corruption', costPct: -0.05 }, { ability: 'curse_of_agony', costPct: -0.05 }] }, 'v', 'Suppression', 'Reduces Affliction spell costs by 5% per rank.', 0, 0),
  passive('wlk_demonic_embrace', 'class', undefined, 3, { stats: { sta: 2 } }, '+', 'Demonic Embrace', 'Increases Stamina by 2 per rank.', 0, 2),
  passive('wlk_imp_corruption', 'class', undefined, 2, { ability: [{ ability: 'corruption', castPct: -0.35, dmgPct: 0.05 }] }, '*', 'Improved Corruption', 'Makes Corruption faster and stronger per rank.', 1, 0, { requires: ['wlk_suppression'] }),
  passive('wlk_demonic_skin', 'class', undefined, 2, { ability: [{ ability: 'demon_skin', dmgPct: 0.20 }], stats: { armorPct: 0.03 } }, '#', 'Improved Demon Skin', 'Strengthens Demon Skin and armor per rank.', 1, 1, { pointsGate: 2 }),
  passive('wlk_cataclysm', 'class', undefined, 3, { ability: [{ ability: 'shadow_bolt', costPct: -0.04 }, { ability: 'immolate', costPct: -0.04 }] }, 'x', 'Cataclysm', 'Reduces destructive spell costs by 4% per rank.', 1, 2, { requires: ['wlk_demonic_embrace'] }),
  choice('wlk_dark_pact', 'class', undefined, '@', 'Dark Pact', 'Choose one warlock emphasis.', 2, 1, [
    { id: 'wlk_pact_affliction', name: 'Nightfall', icon: '*', description: 'Increases Shadow damage by 8%.', effect: { global: { spellDmgPct: 0.08 } } },
    { id: 'wlk_pact_demonology', name: 'Fel Stamina', icon: '+', description: 'Increases Stamina by 8%.', effect: { stats: { staPct: 0.08 } } },
    { id: 'wlk_pact_destruction', name: 'Devastation', icon: 'x', description: 'Increases critical strike by 4%.', effect: { stats: { crit: 0.04 } } },
  ], { pointsGate: 5 }),
  active('wlk_shadowburn', 'class', undefined, { grant: { ability: 'shadowburn' } }, 'x', 'Shadowburn', 'Grants early access to Shadowburn.', 3, 0, { pointsGate: 8, requires: ['wlk_imp_corruption'] }),
  passive('wlk_fel_intellect', 'class', undefined, 2, { stats: { int: 3, sta: 3 } }, '+', 'Fel Intellect', 'Increases Intellect and Stamina by 3 per rank.', 3, 2, { pointsGate: 8, requires: ['wlk_dark_pact'] }),
];

const WARLOCK_SPECS: SpecDef[] = [
  spec('affliction', 'warlock', 'Affliction', 'dps', '*', 'A curse-weaver using damage over time and drains.', 'drain_life', 'Potent Afflictions', 'Increases Shadow spell damage by 12%.', { global: { spellDmgPct: 0.12 } }),
  spec('demonology', 'warlock', 'Demonology', 'dps', '+', 'A durable warlock who survives through demonic resilience.', 'demon_skin', 'Demonic Knowledge', 'Increases Stamina and armor.', { stats: { staPct: 0.10, armorPct: 0.10 } }),
  spec('destruction', 'warlock', 'Destruction', 'dps', 'x', 'A burst caster using Shadow Bolt, fire, and Shadowburn.', 'shadowburn', 'Ruin', 'Increases spell damage and critical strike chance.', { global: { spellDmgPct: 0.10 }, stats: { crit: 0.02 } }),
];

const WARLOCK_SPEC_NODES: TalentNode[] = [
  passive('aff_imp_agony', 'spec', 'affliction', 3, { ability: [{ ability: 'curse_of_agony', dmgPct: 0.08 }] }, '*', 'Improved Curse of Agony', 'Increases Curse of Agony damage by 8% per rank.', 0, 0),
  passive('aff_imp_corruption', 'spec', 'affliction', 3, { ability: [{ ability: 'corruption', dmgPct: 0.08 }] }, '*', 'Improved Corruption', 'Increases Corruption damage by 8% per rank.', 0, 2),
  passive('aff_fel_concentration', 'spec', 'affliction', 2, { ability: [{ ability: 'drain_life', dmgPct: 0.12, costPct: -0.08 }] }, '+', 'Fel Concentration', 'Improves Drain Life damage and cost per rank.', 1, 0, { pointsGate: 2, requires: ['aff_imp_agony'] }),
  passive('aff_amplify_curse', 'spec', 'affliction', 2, { ability: [{ ability: 'curse_of_agony', cooldownPct: -0.10, dmgPct: 0.10 }] }, '*', 'Amplify Curse', 'Improves Curse of Agony pressure per rank.', 1, 2, { pointsGate: 2 }),
  choice('aff_choice', 'spec', 'affliction', '@', 'Soul Harvest', 'Choose one Affliction refinement.', 2, 1, [
    { id: 'aff_choice_siphon', name: 'Siphon Life', icon: '+', description: 'Drain Life heals and damages harder.', effect: { ability: [{ ability: 'drain_life', dmgPct: 0.22 }] } },
    { id: 'aff_choice_shadow', name: 'Shadow Mastery', icon: '*', description: 'Increases spell damage by 10%.', effect: { global: { spellDmgPct: 0.10 } } },
    { id: 'aff_choice_nightfall', name: 'Nightfall', icon: '>', description: 'Shadow Bolt casts 20% faster.', effect: { ability: [{ ability: 'shadow_bolt', castPct: -0.20 }] } },
  ], { pointsGate: 5 }),
  passive('aff_unstable_affliction', 'spec', 'affliction', 2, { ability: [{ ability: 'corruption', dmgPct: 0.10 }, { ability: 'curse_of_agony', dmgPct: 0.10 }] }, '*', 'Unstable Affliction', 'Increases DoT damage per rank.', 3, 1, { pointsGate: 8, requires: ['aff_choice'] }),

  passive('demo_demonic_embrace', 'spec', 'demonology', 3, { stats: { sta: 3 } }, '+', 'Demonic Embrace', 'Increases Stamina by 3 per rank.', 0, 0),
  passive('demo_fel_armor', 'spec', 'demonology', 3, { ability: [{ ability: 'demon_skin', dmgPct: 0.15 }], stats: { armorPct: 0.03 } }, '#', 'Fel Armor', 'Strengthens Demon Skin and armor per rank.', 0, 2),
  passive('demo_health_funnel', 'spec', 'demonology', 2, { ability: [{ ability: 'life_tap', dmgPct: 0.10, costPct: -0.10 }] }, '+', 'Improved Life Tap', 'Improves Life Tap conversion per rank.', 1, 0, { pointsGate: 2, requires: ['demo_demonic_embrace'] }),
  passive('demo_master_summoner', 'spec', 'demonology', 2, { stats: { maxHpPct: 0.04 }, ability: [{ ability: 'fear', castPct: -0.10 }] }, 'O', 'Master Summoner', 'Improves survivability and Fear cast speed per rank.', 1, 2, { pointsGate: 2 }),
  choice('demo_choice', 'spec', 'demonology', '@', 'Demonic Tactics', 'Choose one Demonology refinement.', 2, 1, [
    { id: 'demo_choice_link', name: 'Soul Link', icon: '#', description: 'Increases maximum health by 14%.', effect: { stats: { maxHpPct: 0.14 } } },
    { id: 'demo_choice_master', name: 'Master Demonologist', icon: '*', description: 'Increases spell damage by 8%.', effect: { global: { spellDmgPct: 0.08 } } },
    { id: 'demo_choice_resilience', name: 'Demonic Resilience', icon: '+', description: 'Increases armor and Stamina.', effect: { stats: { armorPct: 0.12, sta: 5 } } },
  ], { pointsGate: 5 }),
  passive('demo_metamorphosis', 'spec', 'demonology', 2, { stats: { staPct: 0.06, armorPct: 0.06 }, global: { spellDmgPct: 0.03 } }, '#', 'Metamorphosis', 'Improves durability and spell damage per rank.', 3, 1, { pointsGate: 8, requires: ['demo_choice'] }),

  passive('dest_cataclysm', 'spec', 'destruction', 3, { ability: [{ ability: 'shadow_bolt', costPct: -0.05 }, { ability: 'immolate', costPct: -0.05 }] }, 'v', 'Cataclysm', 'Reduces destructive spell costs by 5% per rank.', 0, 0),
  passive('dest_bane', 'spec', 'destruction', 3, { ability: [{ ability: 'shadow_bolt', castPct: -0.04 }, { ability: 'immolate', castPct: -0.04 }] }, '>', 'Bane', 'Reduces Shadow Bolt and Immolate cast times per rank.', 0, 2),
  passive('dest_devastation', 'spec', 'destruction', 2, { stats: { crit: 0.02 } }, 'x', 'Devastation', 'Increases critical strike chance by 2% per rank.', 1, 0, { pointsGate: 2, requires: ['dest_cataclysm'] }),
  passive('dest_imp_searing', 'spec', 'destruction', 2, { ability: [{ ability: 'searing_pain', dmgPct: 0.14 }] }, 'x', 'Improved Searing Pain', 'Increases Searing Pain damage by 14% per rank.', 1, 2, { pointsGate: 2 }),
  choice('dest_choice', 'spec', 'destruction', '@', 'Ruin', 'Choose one Destruction refinement.', 2, 1, [
    { id: 'dest_choice_ruin', name: 'Ruin', icon: 'x', description: 'Increases critical strike by 5%.', effect: { stats: { crit: 0.05 } } },
    { id: 'dest_choice_shadowburn', name: 'Shadowburn', icon: '*', description: 'Shadowburn deals 25% more damage.', effect: { ability: [{ ability: 'shadowburn', dmgPct: 0.25 }] } },
    { id: 'dest_choice_emberstorm', name: 'Emberstorm', icon: 'x', description: 'Increases Fire spell damage by 10%.', effect: { ability: [{ ability: 'immolate', dmgPct: 0.12 }, { ability: 'searing_pain', dmgPct: 0.12 }] } },
  ], { pointsGate: 5 }),
  passive('dest_backdraft', 'spec', 'destruction', 2, { global: { spellDmgPct: 0.06 }, ability: [{ ability: 'shadowburn', cooldownPct: -0.10 }] }, 'x', 'Backdraft', 'Increases spell damage and improves Shadowburn per rank.', 3, 1, { pointsGate: 8, requires: ['dest_choice'] }),
];

const DRUID_CLASS: TalentNode[] = [
  passive('dru_natures_grasp', 'class', undefined, 3, { ability: [{ ability: 'entangling_roots', costPct: -0.06 }], stats: { spi: 1 } }, 'v', 'Nature Grasp', 'Reduces Entangling Roots cost and increases Spirit per rank.', 0, 0),
  passive('dru_feral_aggression', 'class', undefined, 3, { ability: [{ ability: 'maul', dmgPct: 0.05 }, { ability: 'claw', dmgPct: 0.05 }] }, 'x', 'Feral Aggression', 'Increases Maul and Claw damage by 5% per rank.', 0, 2),
  passive('dru_imp_mark', 'class', undefined, 2, { ability: [{ ability: 'mark_of_the_wild', dmgPct: 0.20 }], stats: { armorPct: 0.03 } }, '+', 'Improved Mark of the Wild', 'Strengthens Mark of the Wild and armor per rank.', 1, 0, { requires: ['dru_natures_grasp'] }),
  passive('dru_naturalist', 'class', undefined, 2, { ability: [{ ability: 'healing_touch', castPct: -0.08 }, { ability: 'wrath', castPct: -0.04 }] }, '>', 'Naturalist', 'Makes Healing Touch and Wrath faster per rank.', 1, 1, { pointsGate: 2 }),
  passive('dru_thick_hide', 'class', undefined, 3, { stats: { armorPct: 0.04 } }, '#', 'Thick Hide', 'Increases armor by 4% per rank.', 1, 2, { requires: ['dru_feral_aggression'] }),
  choice('dru_natures_path', 'class', undefined, '@', 'Nature Path', 'Choose one druid emphasis.', 2, 1, [
    { id: 'dru_path_balance', name: 'Moonglow', icon: '*', description: 'Increases spell damage by 8%.', effect: { global: { spellDmgPct: 0.08 } } },
    { id: 'dru_path_feral', name: 'Heart of the Wild', icon: 'x', description: 'Increases Stamina and attack power.', effect: { stats: { staPct: 0.08, apPct: 0.08 } } },
    { id: 'dru_path_resto', name: 'Gift of Nature', icon: '+', description: 'Increases healing by 8%.', effect: { global: { healPct: 0.08 } } },
  ], { pointsGate: 5 }),
  active('dru_barkskin', 'class', undefined, { grant: { ability: 'barkskin' } }, '#', 'Barkskin', 'Grants early access to Barkskin.', 3, 0, { pointsGate: 8, requires: ['dru_imp_mark'] }),
  passive('dru_furor', 'class', undefined, 2, { stats: { int: 3, sta: 3 } }, '+', 'Furor', 'Increases Intellect and Stamina by 3 per rank.', 3, 2, { pointsGate: 8, requires: ['dru_natures_path'] }),
];

const DRUID_SPECS: SpecDef[] = [
  spec('balance', 'druid', 'Balance', 'dps', '*', 'A caster who uses lunar and nature magic from range.', 'starfire', 'Moonfury', 'Increases spell damage and Intellect.', { global: { spellDmgPct: 0.10 }, stats: { int: 4 } }),
  spec('feral', 'druid', 'Feral', 'tank', 'x', 'A shapeshifter who tanks in bear form and fights up close.', 'bear_form', 'Heart of the Wild', 'Increases threat, armor, and attack power.', { global: { threatPct: 0.20, meleeDmgPct: 0.06 }, stats: { armorPct: 0.08 } }),
  spec('restoration', 'druid', 'Restoration', 'healer', '+', 'A healer using heal-over-time effects and efficient nature magic.', 'regrowth', 'Gift of Nature', 'Increases healing done by 14%.', { global: { healPct: 0.14 } }),
];

const DRUID_SPEC_NODES: TalentNode[] = [
  passive('bal_imp_wrath', 'spec', 'balance', 3, { ability: [{ ability: 'wrath', castPct: -0.04, dmgPct: 0.05 }] }, '*', 'Improved Wrath', 'Makes Wrath faster and stronger per rank.', 0, 0),
  passive('bal_imp_moonfire', 'spec', 'balance', 3, { ability: [{ ability: 'moonfire', dmgPct: 0.08 }] }, '*', 'Improved Moonfire', 'Increases Moonfire damage by 8% per rank.', 0, 2),
  passive('bal_natures_reach', 'spec', 'balance', 2, { ability: [{ ability: 'entangling_roots', castPct: -0.12 }, { ability: 'starfire', castPct: -0.08 }] }, '>', 'Nature Reach', 'Improves root and Starfire cast flow per rank.', 1, 0, { pointsGate: 2, requires: ['bal_imp_wrath'] }),
  passive('bal_vengeance', 'spec', 'balance', 2, { stats: { crit: 0.02 } }, 'x', 'Vengeance', 'Increases critical strike chance by 2% per rank.', 1, 2, { pointsGate: 2 }),
  choice('bal_choice', 'spec', 'balance', '@', 'Moonkin Path', 'Choose one Balance refinement.', 2, 1, [
    { id: 'bal_choice_moonkin', name: 'Moonkin Form', icon: '#', description: 'Increases armor and spell damage.', effect: { stats: { armorPct: 0.14 }, global: { spellDmgPct: 0.06 } } },
    { id: 'bal_choice_grace', name: 'Nature Grace', icon: '>', description: 'Wrath and Starfire cast 15% faster.', effect: { ability: [{ ability: 'wrath', castPct: -0.15 }, { ability: 'starfire', castPct: -0.15 }] } },
    { id: 'bal_choice_moonglow', name: 'Moonglow', icon: 'v', description: 'Balance spells cost 15% less.', effect: { ability: [{ ability: 'wrath', costPct: -0.15 }, { ability: 'moonfire', costPct: -0.15 }, { ability: 'starfire', costPct: -0.15 }] } },
  ], { pointsGate: 5 }),
  passive('bal_starfire_mastery', 'spec', 'balance', 2, { ability: [{ ability: 'starfire', dmgPct: 0.12, castPct: -0.08 }] }, '*', 'Starfire Mastery', 'Improves Starfire damage and cast speed per rank.', 3, 1, { pointsGate: 8, requires: ['bal_choice'] }),

  passive('feral_thick_hide', 'spec', 'feral', 3, { stats: { armorPct: 0.05 } }, '#', 'Thick Hide', 'Increases armor by 5% per rank.', 0, 0),
  passive('feral_ferocity', 'spec', 'feral', 3, { ability: [{ ability: 'maul', costPct: -0.06 }, { ability: 'claw', costPct: -0.06 }] }, 'v', 'Ferocity', 'Reduces Maul and Claw cost by 6% per rank.', 0, 2),
  passive('feral_brutal_impact', 'spec', 'feral', 2, { ability: [{ ability: 'maul', dmgPct: 0.10 }, { ability: 'swipe', dmgPct: 0.10 }] }, 'x', 'Brutal Impact', 'Increases bear attack damage per rank.', 1, 0, { pointsGate: 2, requires: ['feral_thick_hide'] }),
  passive('feral_feline_swiftness', 'spec', 'feral', 2, { stats: { dodge: 0.02, agi: 2 } }, '>', 'Feline Swiftness', 'Increases dodge and Agility per rank.', 1, 2, { pointsGate: 2 }),
  choice('feral_choice', 'spec', 'feral', '@', 'Feral Instinct', 'Choose one Feral refinement.', 2, 1, [
    { id: 'feral_choice_bear', name: 'Dire Bear', icon: '#', description: 'Increases armor and threat.', effect: { stats: { armorPct: 0.12 }, global: { threatPct: 0.10 } } },
    { id: 'feral_choice_cat', name: 'Predatory Strikes', icon: 'x', description: 'Increases melee damage by 10%.', effect: { global: { meleeDmgPct: 0.10 } } },
    { id: 'feral_choice_survival', name: 'Survival Instincts', icon: '+', description: 'Increases maximum health by 14%.', effect: { stats: { maxHpPct: 0.14 } } },
  ], { pointsGate: 5 }),
  passive('feral_heart_wild', 'spec', 'feral', 2, { stats: { staPct: 0.05, apPct: 0.05 }, global: { threatPct: 0.05 } }, 'x', 'Heart of the Wild', 'Improves stamina, attack power, and threat per rank.', 3, 1, { pointsGate: 8, requires: ['feral_choice'] }),

  passive('rest_imp_rejuv', 'spec', 'restoration', 3, { ability: [{ ability: 'rejuvenation', dmgPct: 0.08 }] }, '+', 'Improved Rejuvenation', 'Increases Rejuvenation healing by 8% per rank.', 0, 0),
  passive('rest_druid_naturalist', 'spec', 'restoration', 3, { ability: [{ ability: 'healing_touch', castPct: -0.05, dmgPct: 0.05 }] }, '+', 'Naturalist', 'Makes Healing Touch faster and stronger per rank.', 0, 2),
  passive('rest_reflection', 'spec', 'restoration', 2, { ability: [{ ability: 'healing_touch', costPct: -0.10 }, { ability: 'rejuvenation', costPct: -0.10 }] }, 'v', 'Reflection', 'Reduces core healing costs by 10% per rank.', 1, 0, { pointsGate: 2, requires: ['rest_imp_rejuv'] }),
  passive('rest_imp_regrowth', 'spec', 'restoration', 2, { ability: [{ ability: 'regrowth', dmgPct: 0.12 }] }, '+', 'Improved Regrowth', 'Increases Regrowth healing by 12% per rank.', 1, 2, { pointsGate: 2 }),
  choice('rest_druid_choice', 'spec', 'restoration', '@', 'Restoration Gift', 'Choose one Restoration refinement.', 2, 1, [
    { id: 'rest_druid_choice_swift', name: 'Nature Swiftness', icon: '>', description: 'Healing Touch casts 25% faster.', effect: { ability: [{ ability: 'healing_touch', castPct: -0.25 }] } },
    { id: 'rest_druid_choice_innervate', name: 'Innervate', icon: 'v', description: 'Healing spells cost 16% less.', effect: { ability: [{ ability: 'healing_touch', costPct: -0.16 }, { ability: 'regrowth', costPct: -0.16 }, { ability: 'rejuvenation', costPct: -0.16 }] } },
    { id: 'rest_druid_choice_living', name: 'Living Spirit', icon: '*', description: 'Increases Spirit by 10.', effect: { stats: { spi: 10 } } },
  ], { pointsGate: 5 }),
  passive('rest_tree_life', 'spec', 'restoration', 2, { global: { healPct: 0.07 }, stats: { spi: 3 } }, '+', 'Tree of Life', 'Increases healing and Spirit per rank.', 3, 1, { pointsGate: 8, requires: ['rest_druid_choice'] }),
];

export const WARLOCK_TALENTS: ClassTalents = { class: 'warlock', nodes: [...WARLOCK_CLASS, ...WARLOCK_SPEC_NODES], specs: WARLOCK_SPECS };
export const DRUID_TALENTS: ClassTalents = { class: 'druid', nodes: [...DRUID_CLASS, ...DRUID_SPEC_NODES], specs: DRUID_SPECS };
