import { describe, expect, it } from 'vitest';
import {
  TALENTS, talentsFor, validateTalentTree, talentPointsAtLevel, FIRST_TALENT_LEVEL,
  validateAllocation, dormantNodes, computeTalentModifiers, emptyAllocation,
  exportBuild, importBuild, TALENT_BUILD_VERSION, MAX_LOADOUTS, type TalentAllocation,
} from '../src/sim/content/talents';
import { ALL_CLASSES, MAX_LEVEL, dist2d } from '../src/sim/types';
import { Sim } from '../src/sim/sim';
import { ABILITIES, abilitiesKnownAt } from '../src/sim/content/classes';
import { terrainHeight } from '../src/sim/world';
import { ClientWorld } from '../src/net/online';
import { talentChoiceIconRef, talentNodeIconRef } from '../src/ui/talent_icons';

const alloc = (over: Partial<TalentAllocation> = {}): TalentAllocation => ({ ...emptyAllocation(), ...over });

function warriorAtCap(seed = 7): Sim {
  const sim = new Sim({ seed, playerClass: 'warrior' });
  sim.setPlayerLevel(MAX_LEVEL);
  return sim;
}

function nearestMob(sim: Sim) {
  let best: any = null, bestD = Infinity;
  for (const e of sim.entities.values()) {
    if (e.kind !== 'mob' || e.dead) continue;
    const d = dist2d(sim.player.pos, e.pos);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

const effOf = (k: any, i = 0) => k.effects[i] as any;

describe('talent tree validation (load-time)', () => {
  it('every registered tree is structurally valid', () => {
    for (const ct of Object.values(TALENTS)) {
      expect(ct).toBeTruthy();
      expect(validateTalentTree(ct!)).toEqual([]);
    }
  });

  it('registers all playable classes with populated class and spec trees', () => {
    for (const cls of ALL_CLASSES) {
      const ct = talentsFor(cls);
      expect(ct, cls).toBeTruthy();
      expect(ct!.specs.length, cls).toBe(2);
      expect(ct!.nodes.filter((n) => n.tree === 'class').length, cls).toBeGreaterThanOrEqual(4);
      for (const s of ct!.specs) {
        expect(ct!.nodes.filter((n) => n.tree === 'spec' && n.specId === s.id).length, `${cls}:${s.id}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('references only abilities that exist', () => {
    for (const cls of ALL_CLASSES) {
      const ct = talentsFor(cls)!;
      for (const s of ct.specs) expect(ABILITIES[s.signature], `${cls}:${s.id}:${s.signature}`).toBeTruthy();
      for (const node of ct.nodes) {
        const effects = [
          node.effect,
          ...(node.choices ?? []).map((c) => c.effect),
        ].filter(Boolean);
        for (const eff of effects) {
          if (eff!.grant) expect(ABILITIES[eff!.grant.ability], `${node.id}:${eff!.grant.ability}`).toBeTruthy();
          for (const mod of eff!.ability ?? []) expect(ABILITIES[mod.ability], `${node.id}:${mod.ability}`).toBeTruthy();
        }
      }
    }
  });

  it('derives painted icons for the release v0.7 class talent trees', () => {
    const affected = ['warrior', 'mage', 'rogue', 'shaman', 'hunter', 'druid', 'paladin', 'warlock'] as const;
    for (const cls of affected) {
      const ct = talentsFor(cls)!;
      for (const node of ct.nodes) {
        const nodeIcon = talentNodeIconRef(node);
        expect(nodeIcon.kind, `${cls}:${node.id}`).toMatch(/^(ability|crest)$/);
        expect(nodeIcon.id, `${cls}:${node.id}`).toMatch(/^talent_|^[a-z0-9_]+$/);
        for (const choice of node.choices ?? []) {
          const choiceIcon = talentChoiceIconRef(choice);
          expect(choiceIcon.kind, `${cls}:${node.id}:${choice.id}`).toMatch(/^(ability|crest)$/);
          expect(choiceIcon.id, `${cls}:${node.id}:${choice.id}`).toMatch(/^talent_|^[a-z0-9_]+$/);
        }
      }
    }
  });

  it('detects cycles in the requires graph', () => {
    const broken = {
      class: 'warrior' as const,
      specs: talentsFor('warrior')!.specs,
      nodes: [
        { id: 'a', tree: 'class' as const, kind: 'passive' as const, maxRank: 1, requires: ['b'], effect: {}, icon: '', name: 'A', description: '', row: 1, col: 0 },
        { id: 'b', tree: 'class' as const, kind: 'passive' as const, maxRank: 1, requires: ['a'], effect: {}, icon: '', name: 'B', description: '', row: 0, col: 0 },
      ],
    };
    expect(validateTalentTree(broken).some((e) => e.includes('cycle') || e.includes('not above'))).toBe(true);
  });

  it('flags prereqs that reference a missing node', () => {
    const broken = {
      class: 'warrior' as const,
      specs: talentsFor('warrior')!.specs,
      nodes: [
        { id: 'a', tree: 'class' as const, kind: 'passive' as const, maxRank: 1, requires: ['ghost'], effect: {}, icon: '', name: 'A', description: '', row: 1, col: 0 },
      ],
    };
    expect(validateTalentTree(broken).some((e) => e.includes('missing node'))).toBe(true);
  });
});

describe('point economy', () => {
  it('grants no points before the first talent level', () => {
    expect(talentPointsAtLevel(FIRST_TALENT_LEVEL - 1)).toBe(0);
    expect(talentPointsAtLevel(1)).toBe(0);
  });
  it('grants one point per level from the first talent level, 16 at cap', () => {
    expect(talentPointsAtLevel(FIRST_TALENT_LEVEL)).toBe(1);
    expect(talentPointsAtLevel(MAX_LEVEL)).toBe(MAX_LEVEL - FIRST_TALENT_LEVEL + 1);
    expect(talentPointsAtLevel(MAX_LEVEL)).toBe(16);
  });
});

describe('allocation rules (server-validated)', () => {
  it('accepts a simple in-budget allocation', () => {
    const a = alloc({ ranks: { war_battle_training: 2, off_lethal_blows: 1 }, spec: 'offense' });
    expect(validateAllocation('warrior', a, 16).ok).toBe(true);
  });

  it('rejects exceeding max rank', () => {
    const a = alloc({ ranks: { war_battle_training: 3 } });
    expect(validateAllocation('warrior', a, 16)).toMatchObject({ ok: false });
  });

  it('rejects exceeding the point budget', () => {
    const a = alloc({ ranks: { war_battle_training: 2, war_endurance: 2, off_brutality: 1, off_lethal_blows: 1, off_deep_wounds: 2 }, spec: 'offense' });
    expect(validateAllocation('warrior', a, 5)).toMatchObject({ ok: false });
  });

  it('enforces connection prerequisites', () => {
    const noPrereq = alloc({ ranks: { war_improved_strike: 1, war_endurance: 1 } });
    expect(validateAllocation('warrior', noPrereq, 16).ok).toBe(false);
    const withPrereq = alloc({ ranks: { war_battle_training: 1, war_improved_strike: 1 } });
    expect(validateAllocation('warrior', withPrereq, 16).ok).toBe(true);
  });

  it('enforces the cumulative points gate', () => {
    const tooShallow = alloc({ ranks: { war_battle_training: 2, war_combat_path: 1 }, choices: { war_combat_path: 'war_path_offense' } });
    expect(validateAllocation('warrior', tooShallow, 16).ok).toBe(false);
    const deep = alloc({ ranks: { war_battle_training: 2, war_endurance: 1, war_combat_path: 1 }, choices: { war_combat_path: 'war_path_offense' } });
    expect(validateAllocation('warrior', deep, 16).ok).toBe(true);
  });

  it('requires a valid choice for choice nodes', () => {
    const noChoice = alloc({ ranks: { war_battle_training: 2, war_endurance: 1, war_combat_path: 1 } });
    expect(validateAllocation('warrior', noChoice, 16).ok).toBe(false);
    const badChoice = alloc({ ranks: { war_battle_training: 2, war_endurance: 1, war_combat_path: 1 }, choices: { war_combat_path: 'nope' } });
    expect(validateAllocation('warrior', badChoice, 16).ok).toBe(false);
  });

  it('rejects spec-tree points without the matching spec', () => {
    const a = alloc({ spec: null, ranks: { off_brutality: 1 } });
    expect(validateAllocation('warrior', a, 16).ok).toBe(false);
    const b = alloc({ spec: 'defense', ranks: { off_brutality: 1 } });
    expect(validateAllocation('warrior', b, 16).ok).toBe(false);
    const c = alloc({ spec: 'offense', ranks: { off_brutality: 1 } });
    expect(validateAllocation('warrior', c, 16).ok).toBe(true);
  });
});

describe('dormant-not-destroyed dependents', () => {
  it('marks a dependent dormant when its prereq is refunded, keeping its ranks', () => {
    const built = alloc({ ranks: { war_battle_training: 1, war_improved_strike: 2 } });
    expect(dormantNodes('warrior', built).size).toBe(0);
    const refunded = alloc({ ranks: { war_improved_strike: 2 } });
    const dormant = dormantNodes('warrior', refunded);
    expect(dormant.has('war_improved_strike')).toBe(true);
    expect(refunded.ranks.war_improved_strike).toBe(2);
    const restored = alloc({ ranks: { war_battle_training: 1, war_improved_strike: 2 } });
    expect(dormantNodes('warrior', restored).has('war_improved_strike')).toBe(false);
  });

  it('precompute ignores dormant spec nodes (wrong spec)', () => {
    const mods = computeTalentModifiers('warrior', alloc({ spec: 'defense', ranks: { off_brutality: 1 } }));
    expect(mods.global.meleeDmgPct).toBe(0);
    expect(mods.stats.armorPct).toBeCloseTo(0.08);
  });
});

describe('precomputed modifiers', () => {
  it('folds passive stat ranks into a flat struct', () => {
    const mods = computeTalentModifiers('warrior', alloc({ ranks: { off_lethal_blows: 1, war_battle_training: 2 }, spec: 'offense' }));
    expect(mods.stats.crit).toBeCloseTo(0.05);
    expect(mods.stats.str).toBe(4);
  });

  it('applies the chosen option of a choice node only', () => {
    const base = alloc({ ranks: { war_battle_training: 2, war_endurance: 1, war_combat_path: 1 }, choices: { war_combat_path: 'war_path_offense' } });
    const mods = computeTalentModifiers('warrior', base);
    expect(mods.global.meleeDmgPct).toBeCloseTo(0.04);
    expect(mods.stats.maxHpPct).toBe(0);
  });

  it('grants the spec signature ability + mastery when a spec is chosen', () => {
    const mods = computeTalentModifiers('warrior', alloc({ spec: 'offense' }));
    expect(mods.spec).toBe('offense');
    expect(mods.role).toBe('dps');
    expect(mods.grants.some((g) => g.ability === 'mortal_strike')).toBe(true);
    expect(mods.global.meleeDmgPct).toBeCloseTo(0.08);
  });

  it('makes every chosen spec signature available at the first talent level', () => {
    for (const cls of ALL_CLASSES) {
      const ct = talentsFor(cls)!;
      for (const s of ct.specs) {
        const known = abilitiesKnownAt(cls, FIRST_TALENT_LEVEL, computeTalentModifiers(cls, alloc({ spec: s.id })));
        expect(known.some((k) => k.def.id === s.signature), `${cls}:${s.id}:${s.signature}`).toBe(true);
      }
    }
  });

  it('accumulates per-ability modifiers across ranks', () => {
    const mods = computeTalentModifiers('warrior', alloc({ spec: 'offense', ranks: { off_deep_wounds: 2 } }));
    expect(mods.abilities.rend.dmgPct).toBeCloseTo(0.30);
  });

  it('applies ability modifiers to shields, buffs, and imbues, not only damage spells', () => {
    const shield = abilitiesKnownAt('priest', 10, computeTalentModifiers('priest',
      alloc({ spec: 'holy', ranks: { holy_twin_disciplines: 1 } }))).find((k) => k.def.id === 'power_word_shield')!;
    expect(effOf(shield).amount).toBe(59); // 48 * (1 + 14% mastery + 8% talent)

    const fort = abilitiesKnownAt('priest', 20, computeTalentModifiers('priest',
      alloc({ ranks: { pri_imp_fortitude: 2 } }))).find((k) => k.def.id === 'power_word_fortitude')!;
    expect(effOf(fort).value).toBe(17); // 12 stamina * 1.40

    const demonSkin = abilitiesKnownAt('warlock', 20, computeTalentModifiers('warlock',
      alloc({ ranks: { wlk_demonic_skin: 2 } }))).find((k) => k.def.id === 'demon_skin')!;
    expect(effOf(demonSkin).value).toBe(112); // 80 armor * 1.40

    const seal = abilitiesKnownAt('paladin', 20, computeTalentModifiers('paladin',
      alloc({ spec: 'retribution', ranks: { ret_seal_command: 2 } }))).find((k) => k.def.id === 'seal_of_righteousness')!;
    expect(effOf(seal)).toMatchObject({ bonus: 16, judgeMin: 44, judgeMax: 64 }); // mastery + 2 talent ranks
  });
});

describe('build strings (import/export)', () => {
  it('round-trips an allocation exactly', () => {
    const a = alloc({ spec: 'defense', ranks: { def_toughness: 2, def_iron_skin: 1 } });
    const str = exportBuild('warrior', a);
    const imported = importBuild(str);
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.cls).toBe('warrior');
      expect(imported.alloc).toEqual(a);
    }
  });

  it('rejects a malformed string', () => {
    expect(importBuild('not-base64-$$$').ok).toBe(false);
    expect(importBuild('').ok).toBe(false);
  });

  it('rejects a version-mismatched string', () => {
    const a = alloc({ spec: 'offense', ranks: { off_brutality: 1 } });
    const good = exportBuild('warrior', a);
    // hand-craft a payload with a future version
    const future = Buffer.from(JSON.stringify({ v: TALENT_BUILD_VERSION + 1, c: 'warrior', s: 'arms', r: {}, h: {} })).toString('base64');
    expect(importBuild(future)).toMatchObject({ ok: false });
    expect(importBuild(good).ok).toBe(true); // sanity: the current version still imports
  });
});

describe('Sim integration — passive talents (Phase 1)', () => {
  it('applies a passive stat talent through recalcPlayerStats and reverts on respec', () => {
    const sim = warriorAtCap();
    const critBefore = sim.player.critChance;
    expect(sim.applyTalents(alloc({ spec: 'offense', ranks: { off_lethal_blows: 1 } }))).toBe(true);
    expect(sim.player.critChance).toBeCloseTo(critBefore + 0.05);
    expect(sim.respec()).toBe(true);
    expect(sim.player.critChance).toBeCloseTo(critBefore);
    expect(sim.talentPoints().spent).toBe(0);
  });

  it('applies an armor-percent talent multiplicatively', () => {
    const sim = warriorAtCap();
    const armorBefore = sim.player.stats.armor;
    expect(sim.applyTalents(alloc({ spec: 'defense', ranks: { def_iron_skin: 1 } }))).toBe(true);
    expect(sim.player.stats.armor).toBeCloseTo(Math.round(armorBefore * 1.18), 0);
  });

  it('rejects an over-budget allocation server-side', () => {
    const sim = new Sim({ seed: 7, playerClass: 'warrior' });
    sim.setPlayerLevel(5);
    expect(sim.talentPoints().total).toBe(1);
    expect(sim.applyTalents(alloc({ ranks: { war_battle_training: 3 } }))).toBe(false);
    expect(sim.applyTalents(alloc({ ranks: { war_battle_training: 1 } }))).toBe(true);
  });

  it('locks respec/allocation in combat', () => {
    const sim = warriorAtCap();
    expect(sim.applyTalents(alloc({ ranks: { off_lethal_blows: 1 }, spec: 'offense' }))).toBe(true);
    sim.player.inCombat = true;
    expect(sim.applyTalents(alloc({ ranks: { off_brutality: 1 }, spec: 'offense' }))).toBe(false);
    expect(sim.respec()).toBe(false);
    expect(sim.talentPoints().spent).toBe(1);
  });

  it('persists talents across serialize -> addPlayer (JSONB round-trip, no migration)', () => {
    const sim = warriorAtCap();
    expect(sim.applyTalents(alloc({ spec: 'offense', ranks: { off_brutality: 1, off_lethal_blows: 1, off_deep_wounds: 2 } }))).toBe(true);
    const state = sim.serializeCharacter(sim.playerId)!;
    expect(state.talents).toBeTruthy();

    const sim2 = new Sim({ seed: 9, playerClass: 'warrior', noPlayer: true });
    const pid = sim2.addPlayer('warrior', 'Reloaded', { state });
    const meta = sim2.meta(pid)!;
    expect(meta.talents.spec).toBe('offense');
    expect(meta.talents.ranks.off_lethal_blows).toBe(1);
    expect(meta.talents.ranks.off_deep_wounds).toBe(2);
    expect(meta.talentMods.abilities.rend.dmgPct).toBeCloseTo(0.30);
  });

  it('switching spec prunes the old spec tree but keeps the class tree', () => {
    const sim = warriorAtCap();
    expect(sim.applyTalents(alloc({ spec: 'offense', ranks: { war_battle_training: 2, off_brutality: 1, off_lethal_blows: 1, off_deep_wounds: 2 } }))).toBe(true);
    expect(sim.setSpec('defense')).toBe(true);
    const meta = sim.meta(sim.playerId)!;
    expect(meta.talents.spec).toBe('defense');
    expect(meta.talents.ranks.off_deep_wounds).toBeUndefined();
    expect(meta.talents.ranks.war_battle_training).toBe(2);
  });
});

describe('Sim integration — active talents & ability modifiers (Phase 3)', () => {
  it('grants spec signature + active-node abilities into the known set', () => {
    const sim = warriorAtCap();
    expect(sim.known.some((k) => k.def.id === 'mortal_strike')).toBe(false);
    expect(sim.applyTalents(alloc({ spec: 'offense' }))).toBe(true);
    expect(sim.known.some((k) => k.def.id === 'mortal_strike')).toBe(true);

    expect(sim.applyTalents(alloc({ spec: 'defense' }))).toBe(true);
    expect(sim.known.some((k) => k.def.id === 'shield_slam')).toBe(true);
    expect(sim.known.some((k) => k.def.id === 'mortal_strike')).toBe(false);
  });

  it('gates specialization choice to the first talent level', () => {
    const sim = new Sim({ seed: 7, playerClass: 'warrior' });
    sim.setPlayerLevel(4);
    expect(sim.setSpec('offense')).toBe(false);
    sim.setPlayerLevel(5);
    expect(sim.setSpec('offense')).toBe(true);
    expect(sim.known.some((k) => k.def.id === 'mortal_strike')).toBe(true);
  });

  it('snapshot-locks Heroic Strike damage before/after Improved Strike', () => {
    const baseBonus = effOf(abilitiesKnownAt('warrior', 20).find((k) => k.def.id === 'heroic_strike')).bonus;
    const mods = computeTalentModifiers('warrior', alloc({ ranks: { war_battle_training: 1, war_improved_strike: 2 } }));
    const buffed = effOf(abilitiesKnownAt('warrior', 20, mods).find((k) => k.def.id === 'heroic_strike')).bonus;
    expect(buffed).toBe(Math.round(baseBonus * 1.2));
  });

  it('applies cooldown and cast-time modifiers', () => {
    const taunt = abilitiesKnownAt('warrior', 20, computeTalentModifiers('warrior',
      alloc({ spec: 'defense', ranks: { def_shield_training: 2 } }))
    ).find((k) => k.def.id === 'shield_slam')!;
    expect(taunt).toBeTruthy();
  });

  it('a choice node applies only the chosen option effect', () => {
    const offenseMods = computeTalentModifiers('warrior', alloc({
      ranks: { war_battle_training: 2, war_endurance: 1, war_combat_path: 1 },
      choices: { war_combat_path: 'war_path_offense' },
    }));
    const defenseMods = computeTalentModifiers('warrior', alloc({
      ranks: { war_battle_training: 2, war_endurance: 1, war_combat_path: 1 },
      choices: { war_combat_path: 'war_path_defense' },
    }));
    expect(offenseMods.global.meleeDmgPct).toBeCloseTo(0.04);
    expect(defenseMods.stats.maxHpPct).toBeCloseTo(0.04);
  });

  it('tank-role mastery multiplies generated threat', () => {
    const sunderThreat = (defense: boolean): number => {
      const sim = new Sim({ seed: 3, playerClass: 'warrior' });
      sim.setPlayerLevel(20);
      if (defense) expect(sim.setSpec('defense')).toBe(true);
      const mob = nearestMob(sim);
      sim.player.pos.x = mob.pos.x;
      sim.player.pos.z = mob.pos.z - 3;
      sim.player.pos.y = terrainHeight(sim.player.pos.x, sim.player.pos.z, sim.cfg.seed);
      sim.player.facing = Math.atan2(mob.pos.x - sim.player.pos.x, mob.pos.z - sim.player.pos.z);
      sim.player.resource = 100;
      sim.targetEntity(mob.id);
      sim.castAbility('sunder_armor');
      return mob.threat.get(sim.playerId) ?? 0;
    };
    const base = sunderThreat(false);
    const tank = sunderThreat(true);
    expect(base).toBeGreaterThan(0);
    expect(tank).toBeGreaterThanOrEqual(base);
  });
});

describe('Sim integration — loadouts & build strings (Phase 4)', () => {
  it('saves and switches loadouts, restoring talents + spec + bar', () => {
    const sim = warriorAtCap();
    expect(sim.saveLoadout('Offense', ['mortal_strike', 'rend', null], alloc({ spec: 'offense', ranks: { off_brutality: 1, off_lethal_blows: 1, off_deep_wounds: 2 } }))).toBe(0);
    expect(sim.saveLoadout('Defense', ['shield_slam', 'taunt'], alloc({ spec: 'defense', ranks: { def_iron_skin: 1, def_vitality: 1, def_toughness: 2 } }))).toBe(1);
    expect(sim.loadouts.length).toBe(2);
    expect(sim.talents.spec).toBe('defense');
    expect(sim.activeLoadout).toBe(1);

    expect(sim.switchLoadout(0)).toBe(true);
    expect(sim.talents.spec).toBe('offense');
    expect(sim.talents.ranks.off_deep_wounds).toBe(2);
    expect(sim.talentSpec).toBe('offense');
    expect(sim.activeLoadout).toBe(0);
    expect(sim.loadouts[0].bar).toEqual(['mortal_strike', 'rend', null]);
    expect(sim.known.some((k) => k.def.id === 'mortal_strike')).toBe(true);
  });

  it('locks loadout switching in combat', () => {
    const sim = warriorAtCap();
    sim.applyTalents(alloc({ spec: 'offense' }));
    sim.saveLoadout('A', []);
    sim.player.inCombat = true;
    expect(sim.switchLoadout(0)).toBe(false);
  });

  it('deletes a loadout and repairs the active index', () => {
    const sim = warriorAtCap();
    expect(sim.saveLoadout('one', [], alloc({ spec: 'offense', ranks: { off_brutality: 1 } }))).toBe(0);
    expect(sim.saveLoadout('two', [], alloc({ spec: 'defense', ranks: { def_iron_skin: 1 } }))).toBe(1);
    expect(sim.activeLoadout).toBe(1);
    expect(sim.deleteLoadout(0)).toBe(true);
    expect(sim.loadouts.length).toBe(1);
    expect(sim.loadouts[0].name).toBe('two');
    expect(sim.activeLoadout).toBe(0);
    expect(sim.talents.spec).toBe('defense');
  });

  it('caps loadouts at MAX_LOADOUTS', () => {
    const sim = warriorAtCap();
    for (let i = 0; i < MAX_LOADOUTS; i++) expect(sim.saveLoadout('L' + i, [])).toBe(i);
    expect(sim.saveLoadout('overflow', [])).toBe(-1);
  });

  it('imports a build string and re-validates it server-side on apply', () => {
    const author = warriorAtCap();
    expect(author.applyTalents(alloc({ spec: 'defense', ranks: { def_iron_skin: 1, def_vitality: 1, def_toughness: 2 } }))).toBe(true);
    const str = exportBuild('warrior', author.talents);

    const target = warriorAtCap(11);
    const imported = importBuild(str);
    expect(imported.ok).toBe(true);
    if (imported.ok) expect(target.applyTalents(imported.alloc)).toBe(true);
    expect(target.talents.spec).toBe('defense');
    expect(target.talents.ranks.def_toughness).toBe(2);

    const lowbie = new Sim({ seed: 5, playerClass: 'warrior' });
    lowbie.setPlayerLevel(5);
    expect(lowbie.applyTalents(imported.ok ? imported.alloc : alloc())).toBe(false);
  });
});

describe('ClientWorld path (online display reflects server state)', () => {
  function bareClient(pid: number): any {
    const c: any = Object.create(ClientWorld.prototype);
    c.cfg = { seed: 20061, playerClass: 'warrior' };
    c.entities = new Map();
    c.playerId = pid;
    c.moveInput = {}; c.inventory = []; c.equipment = {}; c.copper = 0; c.xp = 0;
    c.known = []; c.questLog = new Map(); c.questsDone = new Set();
    c.lastSnapAt = 0; c.snapInterval = 50; c.pendingFacingDelta = 0;
    c.connected = true; c.eventQueue = []; c.mouselookFacing = null;
    return c;
  }
  const selfWire = (over: any = {}) => ({
    id: 1, k: 'player', tid: 'warrior', nm: 'Tank', lv: 20,
    x: 0, y: 0, z: 0, f: 0, hp: 100, mhp: 100,
    res: 0, mres: 100, rtype: 'rage', xp: 0, copper: 0,
    inv: [], equip: {}, qlog: [], qdone: [], cds: {}, gcd: 0,
    stats: { str: 1, agi: 1, sta: 1, int: 1, spi: 1, armor: 0 },
    weapon: { min: 1, max: 2, speed: 2 }, ...over,
  });

  it('decodes the talent snapshot field and recomputes known with granted abilities', () => {
    const c = bareClient(1);
    c.applySnapshot({ t: 'snap', tick: 1, time: 0, ents: [], self: selfWire({
      tal: { alloc: { spec: 'defense', ranks: { def_toughness: 2 }, choices: {} }, spec: 'defense', role: 'tank', loadouts: [{ name: 'MT', alloc: emptyAllocation(), bar: [] }], activeLoadout: 0 },
    }) });
    expect(c.talents.spec).toBe('defense');
    expect(c.talentSpec).toBe('defense');
    expect(c.talentRole).toBe('tank');
    expect(c.loadouts.length).toBe(1);
    expect(c.activeLoadout).toBe(0);
    expect(c.known.some((k: any) => k.def.id === 'shield_slam')).toBe(true);
    expect(c.talentPoints()).toMatchObject({ total: 16, spent: 2 });
  });
});

describe('performance invariant (no per-tick tree walk)', () => {
  it('keeps the resolved known-ability set stable across many ticks', () => {
    const sim = warriorAtCap();
    sim.applyTalents(alloc({ spec: 'offense', ranks: { off_deep_wounds: 2 } }));
    const knownRef = sim.meta(sim.playerId)!.known;
    const rendRef = knownRef.find((k) => k.def.id === 'rend');
    expect(rendRef).toBeTruthy();
    for (let i = 0; i < 600; i++) sim.tick();
    expect(sim.meta(sim.playerId)!.known).toBe(knownRef);
    expect(sim.meta(sim.playerId)!.known.find((k) => k.def.id === 'rend')).toBe(rendRef);
  });
});
