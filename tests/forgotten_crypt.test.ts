// Forgotten Crypt (hollow_crypt): first dungeon vertical slice — entry quest,
// elite/boss kills, loot, and quest chain gating.
import { describe, expect, it } from 'vitest';
import { MOBS, instanceOrigin } from '../src/sim/data';
import type { Entity } from '../src/sim/types';
import { Sim } from '../src/sim/sim';
import { groundHeight } from '../src/sim/world';

function makeSim(level = 10) {
  const sim = new Sim({ seed: 42, playerClass: 'warrior', autoEquip: true });
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

describe('Forgotten Crypt dungeon slice', () => {
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
});
