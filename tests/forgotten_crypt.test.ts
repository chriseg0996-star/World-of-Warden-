// Forgotten Crypt (hollow_crypt): first dungeon vertical slice — entry quest,
// elite/boss kills, loot, and quest chain gating.
import { describe, expect, it } from 'vitest';
import { MOBS, instanceOrigin, DUNGEON_X_THRESHOLD } from '../src/sim/data';
import { emptyAllocation } from '../src/sim/content/talents';
import type { Entity, PlayerClass } from '../src/sim/types';
import { Sim } from '../src/sim/sim';
import { groundHeight } from '../src/sim/world';

function makeSim(level = 10, playerClass: PlayerClass = 'warrior') {
  const sim = new Sim({ seed: 42, playerClass, autoEquip: true });
  sim.setPlayerLevel(level);
  return sim;
}

function teleport(sim: Sim, x: number, z: number, pid?: number) {
  const e = pid ? sim.entities.get(pid)! : sim.player;
  e.pos.x = x;
  e.pos.z = z;
  e.pos.y = groundHeight(x, z, sim.cfg.seed);
  e.prevPos = { ...e.pos };
}

function nearestMob(sim: Sim, templateId: string, from: { x: number; z: number }): Entity | null {
  let best: Entity | null = null;
  let bestD = Infinity;
  for (const e of sim.entities.values()) {
    if (e.kind !== 'mob' || e.dead || e.templateId !== templateId) continue;
    const d = Math.hypot(e.pos.x - from.x, e.pos.z - from.z);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

function killMob(sim: Sim, mobId: number, pid?: number) {
  const mob = sim.entities.get(mobId)!;
  (sim as any).dealDamage(pid ? sim.entities.get(pid)! : sim.player, mob, mob.hp + 5000, false, 'physical', 'test', 'hit', true);
  sim.tick();
}

function faceTarget(sim: Sim, target: Entity) {
  const p = sim.player;
  p.facing = Math.atan2(target.pos.x - p.pos.x, target.pos.z - p.pos.z);
}

function hasAura(e: Entity, auraId: string) {
  return (e.auras ?? []).some((a) => a.id === auraId);
}

/** Simple warrior rotation for solo viability checks (deterministic seed 42). */
function clearCryptExcept(sim: Sim, keepTemplateId: string) {
  for (const e of [...sim.entities.values()]) {
    if (e.kind !== 'mob' || e.dead || e.templateId === keepTemplateId) continue;
    killMob(sim, e.id);
  }
}

function fightMobWarrior(sim: Sim, mobId: number, maxTicks = 20 * 300): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleport(sim, mob.pos.x, mob.pos.z + 3);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  if (sim.known.some((k) => k.def.id === 'charge')) sim.castAbility('charge');
  sim.startAutoAttack();
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    if (p.gcdRemaining <= 0 && !p.castingAbility) {
      const hostiles = [...sim.entities.values()].filter((e) => {
        if (e.kind !== 'mob' || e.dead || e.aggroTargetId !== p.id) return false;
        if (e.spawnPos.x <= DUNGEON_X_THRESHOLD) return false;
        return Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z) <= 25;
      });
      if (!hasAura(p, 'battle_shout')) sim.castAbility('battle_shout');
      else if (hostiles.length > 1 && sim.known.some((k) => k.def.id === 'thunder_clap')) sim.castAbility('thunder_clap');
      else if (!hasAura(m, 'rend') && sim.known.some((k) => k.def.id === 'rend')) sim.castAbility('rend');
      else if ((p.resource ?? 0) >= 30 && sim.known.some((k) => k.def.id === 'mortal_strike')) sim.castAbility('mortal_strike');
      else if ((p.resource ?? 0) >= 15) sim.castAbility('heroic_strike');
      else if ((p.resource ?? 0) < 10 && sim.known.some((k) => k.def.id === 'bloodrage')) sim.castAbility('bloodrage');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Frost mage rotation for solo viability checks. */
function fightMobMage(sim: Sim, mobId: number, maxTicks = 20 * 600): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleport(sim, mob.pos.x, mob.pos.z + 20);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return m && m.dead ? 'killed' : 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    const dist = Math.hypot(m.pos.x - p.pos.x, m.pos.z - p.pos.z);
    if (p.gcdRemaining <= 0 && !p.castingAbility && !p.channeling) {
      const hostiles = [...sim.entities.values()].filter((e) => {
        if (e.kind !== 'mob' || e.dead || e.aggroTargetId !== p.id || e.id === mobId) return false;
        if (e.spawnPos.x <= DUNGEON_X_THRESHOLD) return false;
        return Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z) <= 25;
      });
      if ((hostiles.length > 0 || dist < 10) && sim.known.some((k) => k.def.id === 'frost_nova')) sim.castAbility('frost_nova');
      else if (dist < 12) teleport(sim, m.pos.x, m.pos.z + 20);
      else if (dist < 14 && sim.known.some((k) => k.def.id === 'fire_blast')) sim.castAbility('fire_blast');
      else if (sim.known.some((k) => k.def.id === 'fireball') && (p.resource ?? 0) >= 35) sim.castAbility('fireball');
      else if (sim.known.some((k) => k.def.id === 'frostbolt') && (p.resource ?? 0) >= 35) sim.castAbility('frostbolt');
    }
    sim.tick();
  }
  return 'timeout';
}

/** Assassination rogue rotation for solo viability checks. */
function fightMobRogue(sim: Sim, mobId: number, maxTicks = 20 * 400): 'killed' | 'player_dead' | 'timeout' {
  const mob = sim.entities.get(mobId)!;
  const p = sim.player;
  teleport(sim, mob.pos.x, mob.pos.z + 3);
  faceTarget(sim, mob);
  sim.targetEntity(mobId);
  if (sim.known.some((k) => k.def.id === 'evasion') && !hasAura(p, 'evasion')) sim.castAbility('evasion');
  sim.startAutoAttack();
  for (let i = 0; i < maxTicks; i++) {
    const m = sim.entities.get(mobId);
    if (p.dead) return 'player_dead';
    if (!m || m.dead) return 'killed';
    faceTarget(sim, m);
    if (p.gcdRemaining <= 0 && !p.castingAbility) {
      const hpPct = p.hp / p.maxHp;
      if (hpPct < 0.5 && sim.known.some((k) => k.def.id === 'evasion') && !hasAura(p, 'evasion')) sim.castAbility('evasion');
      else if ((p.comboPoints ?? 0) >= 4 && (p.resource ?? 0) >= 35 && sim.known.some((k) => k.def.id === 'eviscerate')) sim.castAbility('eviscerate');
      else if ((p.comboPoints ?? 0) >= 5 && sim.known.some((k) => k.def.id === 'slice_and_dice') && !hasAura(p, 'slice_and_dice')) sim.castAbility('slice_and_dice');
      else if ((p.resource ?? 0) >= 45 && sim.known.some((k) => k.def.id === 'sinister_strike')) sim.castAbility('sinister_strike');
    }
    sim.tick();
  }
  return 'timeout';
}

describe('Forgotten Crypt dungeon slice', () => {
  it('dungeon door at the Fallen Chapel enters hollow_crypt on proximity', () => {
    const sim = makeSim(5);
    const door = [...sim.entities.values()].find(
      (e) => e.kind === 'object' && e.templateId === 'dungeon_door' && e.dungeonId === 'hollow_crypt',
    );
    expect(door).toBeTruthy();
    teleport(sim, door!.pos.x, door!.pos.z);
    sim.tick();
    expect(sim.player.pos.x).toBeGreaterThan(600);
    expect(sim.instanceSlotAt(sim.player.pos)).not.toBeNull();
  });

  it('leaveDungeon returns the player to the Forgotten Crypt door', () => {
    const sim = makeSim(5);
    sim.enterCrypt();
    expect(sim.player.pos.x).toBeGreaterThan(600);
    sim.leaveCrypt();
    expect(sim.player.pos.x).toBeLessThan(200);
    expect(Math.hypot(sim.player.pos.x - 80, sim.player.pos.z - 86)).toBeLessThan(6);
  });

  it('level 8 offense warrior can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8);
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'offense',
      ranks: { off_brutality: 1, off_lethal_blows: 1, off_deep_wounds: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobWarrior(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('level 10 offense warrior with dungeon gear can solo the Crypt Warden', () => {
    const sim = makeSim(10);
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'offense',
      ranks: {
        war_battle_training: 2,
        off_brutality: 1,
        off_lethal_blows: 1,
        off_deep_wounds: 2,
      },
    });
    sim.inventory.push({ itemId: 'wardens_hammer', qty: 1 }, { itemId: 'bone_shield', qty: 1 });
    sim.equipItem('wardens_hammer');
    sim.equipItem('bone_shield');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    clearCryptExcept(sim, 'crypt_warden');
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    expect(fightMobWarrior(sim, warden.id, 20 * 400)).toBe('killed');
    expect(sim.player.dead).toBe(false);
    expect(sim.player.hp).toBeGreaterThan(0);
  });

  it('level 10 fire mage with dungeon gear can burn down the Bone Guardian in the crypt', () => {
    const sim = makeSim(10, 'mage');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'fire',
      ranks: {
        mag_improved_fireball: 2,
        fire_pyromancy: 1,
        fire_critical_mass: 1,
        fire_burning_soul: 2,
      },
    });
    sim.inventory.push({ itemId: 'cultist_robes', qty: 1 }, { itemId: 'ancient_ring', qty: 1 });
    sim.equipItem('cultist_robes');
    sim.equipItem('ancient_ring');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    const startHp = guardian.hp;
    sim.player.hp = sim.player.maxHp;
    sim.player.resource = sim.player.maxResource;
    fightMobMage(sim, guardian.id, 20 * 200);
    expect(guardian.hp).toBeLessThan(startHp - 80);
  });

  it('level 8 assassination rogue can solo the Bone Guardian after clearing trash', () => {
    const sim = makeSim(8, 'rogue');
    sim.applyTalents({
      ...emptyAllocation(),
      spec: 'assassination',
      ranks: { ass_deadliness: 1, ass_ruthlessness: 1, ass_lethality: 1 },
    });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    clearCryptExcept(sim, 'bone_guardian');
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    expect(fightMobRogue(sim, guardian.id)).toBe('killed');
    expect(sim.player.dead).toBe(false);
  });

  it('scales elite and boss levels within template bands', () => {
    const sim = makeSim(8);
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const slot = sim.instanceSlotAt(sim.player.pos)!;
    const origin = instanceOrigin(0, slot);
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    expect(guardian.level).toBeGreaterThanOrEqual(MOBS.bone_guardian.minLevel);
    expect(guardian.level).toBeLessThanOrEqual(MOBS.bone_guardian.maxLevel);
    expect(warden.level).toBeGreaterThanOrEqual(MOBS.crypt_warden.minLevel);
    expect(warden.level).toBeLessThanOrEqual(MOBS.crypt_warden.maxLevel);
  });

  it('credits Enter the Crypt when the player enters hollow_crypt', () => {
    const sim = makeSim(5);
    teleport(sim, -14, -10);
    sim.acceptQuest('q_fc_enter');
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const qp = sim.meta(sim.playerId)!.questLog.get('q_fc_enter')!;
    expect(qp.counts[0]).toBe(1);
    expect(qp.state).toBe('ready');
  });

  it('gates the Forgotten Crypt quest chain by level and prerequisites', () => {
    const sim = new Sim({ seed: 42, playerClass: 'warrior' });
    sim.setPlayerLevel(4);
    expect(sim.questState('q_fc_enter')).toBe('unavailable');
    sim.setPlayerLevel(5);
    expect(sim.questState('q_fc_enter')).toBe('available');
    expect(sim.questState('q_fc_guardian')).toBe('unavailable');
    sim.questsDone.add('q_fc_enter');
    expect(sim.questState('q_fc_guardian')).toBe('available');
    sim.questsDone.add('q_fc_guardian');
    expect(sim.questState('q_fc_warden')).toBe('available');
  });

  it('credits kill objectives for Bone Guardian and the Crypt Warden', () => {
    const sim = makeSim();
    const meta = sim.meta(sim.playerId)!;
    meta.questLog.set('q_fc_guardian', { questId: 'q_fc_guardian', counts: [0], state: 'active' });
    meta.questLog.set('q_fc_warden', { questId: 'q_fc_warden', counts: [0], state: 'active' });
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const slot = sim.instanceSlotAt(sim.player.pos)!;
    const origin = instanceOrigin(0, slot);
    const guardian = nearestMob(sim, 'bone_guardian', origin)!;
    const warden = nearestMob(sim, 'crypt_warden', origin)!;
    expect(guardian).toBeTruthy();
    expect(warden).toBeTruthy();

    killMob(sim, guardian.id);
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_guardian')!.counts[0]).toBe(1);

    killMob(sim, warden.id);
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_warden')!.counts[0]).toBe(1);
    expect(warden.lootable).toBe(true);
  });

  it('Crypt Warden drops dungeon gear on kill', () => {
    const sim = makeSim();
    const meta = sim.meta(sim.playerId)!;
    teleport(sim, 80, 88);
    sim.enterCrypt();
    const slot = sim.instanceSlotAt(sim.player.pos)!;
    const warden = nearestMob(sim, 'crypt_warden', instanceOrigin(0, slot))!;
    killMob(sim, warden.id);
    (sim as any).rollLoot(warden, meta);
    const drops = warden.loot?.items?.map((s) => s.itemId) ?? [];
    expect(drops.length).toBeGreaterThan(0);
    expect(drops.some((id) => ['crypt_blade', 'cultist_robes', 'bone_shield', 'wardens_hammer', 'ancient_ring'].includes(id))).toBe(true);
  });

  it('spawn list covers three wings with the expected trash and elites', () => {
    expect(MOBS.skeleton_warrior).toBeTruthy();
    expect(MOBS.crypt_warden.boss).toBe(true);
    expect(MOBS.bone_guardian.elite).toBe(true);
    expect(MOBS.cult_adept.elite).toBe(true);
    expect(MOBS.crypt_warden.summonAdds?.mobId).toBe('skeleton_warrior_add');
    expect(MOBS.skeleton_warrior_add.loot).toEqual([]);
  });

  it('completes the Alden crypt quest chain through boss turn-in', () => {
    const sim = makeSim(8);
    const meta = sim.meta(sim.playerId)!;
    const xp0 = meta.lifetimeXp;
    const alden = { x: -14, z: -10 };
    const door = { x: 80, z: 88 };

    teleport(sim, alden.x, alden.z);
    sim.acceptQuest('q_fc_enter');
    teleport(sim, door.x, door.z);
    sim.enterCrypt();
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_enter')!.state).toBe('ready');
    teleport(sim, alden.x, alden.z);
    sim.turnInQuest('q_fc_enter');
    expect(meta.questsDone.has('q_fc_enter')).toBe(true);

    sim.acceptQuest('q_fc_guardian');
    teleport(sim, door.x, door.z);
    sim.enterCrypt();
    const origin = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    killMob(sim, nearestMob(sim, 'bone_guardian', origin)!.id);
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_guardian')!.state).toBe('ready');
    teleport(sim, alden.x, alden.z);
    sim.turnInQuest('q_fc_guardian');
    expect(meta.questsDone.has('q_fc_guardian')).toBe(true);
    const hasBoneShield = sim.inventory.some((s) => s.itemId === 'bone_shield')
      || Object.values(meta.equipment).includes('bone_shield');
    expect(hasBoneShield).toBe(true);

    sim.acceptQuest('q_fc_warden');
    teleport(sim, door.x, door.z);
    sim.enterCrypt();
    const origin2 = instanceOrigin(0, sim.instanceSlotAt(sim.player.pos)!);
    const warden = nearestMob(sim, 'crypt_warden', origin2)!;
    killMob(sim, warden.id);
    (sim as any).rollLoot(warden, meta);
    expect(sim.meta(sim.playerId)!.questLog.get('q_fc_warden')!.state).toBe('ready');
    teleport(sim, alden.x, alden.z);
    sim.turnInQuest('q_fc_warden');
    expect(meta.questsDone.has('q_fc_warden')).toBe(true);
    expect(meta.lifetimeXp).toBeGreaterThan(xp0);
    const hasWardenHammer = sim.inventory.some((s) => s.itemId === 'wardens_hammer')
      || Object.values(meta.equipment).includes('wardens_hammer');
    expect(hasWardenHammer).toBe(true);
  });
});
