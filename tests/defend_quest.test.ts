// 'defend' quest objective (roadmap Phase 4): entering the objective area arms
// a deterministic wave event that spawns attackers around the point; slaying
// them all completes the objective, while straying beyond the leash fails the
// event and resets the count. Driven through the real zone-1 content
// (q_hold_south_gate at Eastbrook's south gate).
import { describe, expect, it } from 'vitest';
import { Sim } from '../src/sim/sim';
import { QUESTS } from '../src/sim/data';
import type { Entity } from '../src/sim/types';

const QUEST_ID = 'q_hold_south_gate';

function world() {
  const sim = new Sim({ seed: 7, playerClass: 'warrior', noPlayer: true });
  const pid = sim.addPlayer('warrior', 'Aleph');
  const meta = sim.players.get(pid)!;
  const player = sim.entities.get(meta.entityId)!;
  sim.tick();
  const merrick = [...sim.entities.values()].find((e) => e.kind === 'npc' && e.templateId === 'guard_merrick')!;
  return { sim, pid, meta, player, merrick };
}

const point = () => QUESTS[QUEST_ID].objectives[0].point!;

function waveMobs(sim: Sim): Entity[] {
  const p = point();
  return [...sim.entities.values()].filter((e) => {
    if (e.kind !== 'mob' || e.templateId !== 'vale_bandit' || e.dead) return false;
    const dx = e.pos.x - p.x;
    const dz = e.pos.z - p.z;
    return dx * dx + dz * dz < 20 * 20;
  });
}

function acceptAndArm(s: ReturnType<typeof world>) {
  const { sim, pid, meta, player, merrick } = s;
  meta.questsDone.add('q_bandits');
  player.pos.x = merrick.pos.x;
  player.pos.z = merrick.pos.z;
  sim.acceptQuest(QUEST_ID, pid);
  expect(meta.questLog.get(QUEST_ID)?.state).toBe('active');
  player.pos.x = point().x;
  player.pos.z = point().z;
  sim.tick(); // arms the event
  sim.tick(); // first wave spawns
}

describe("'defend' quest objective — q_hold_south_gate", () => {
  it('ships wired to Guard Merrick with a defend objective', () => {
    const q = QUESTS[QUEST_ID];
    expect(q.giverNpcId).toBe('guard_merrick');
    expect(q.requiresQuest).toBe('q_bandits');
    expect(q.objectives[0].type).toBe('defend');
    expect(q.objectives[0].targetMobId).toBe('vale_bandit');
    expect(q.objectives[0].count).toBe(6);
  });

  it('spawns waves at the point and completes after all attackers are slain', () => {
    const s = world();
    const { sim, meta, player } = s;
    acceptAndArm(s);

    let wave = waveMobs(sim);
    expect(wave.length).toBe(2);

    const qp = meta.questLog.get(QUEST_ID)!;
    let slain = 0;
    // kill 3 waves of 2, waiting out the inter-wave delay between them
    for (let w = 0; w < 3; w++) {
      wave = waveMobs(sim);
      expect(wave.length).toBe(2);
      for (const mob of wave) {
        mob.hp = 0;
        (sim as any).handleDeath(mob, player);
        slain++;
        expect(qp.counts[0]).toBe(slain);
      }
      if (w < 2) for (let i = 0; i < 82 && waveMobs(sim).length === 0; i++) sim.tick();
    }
    expect(qp.counts[0]).toBe(6);
    expect(qp.state).toBe('ready');
  });

  it('fails and resets the objective when the player abandons the position', () => {
    const s = world();
    const { sim, meta, player } = s;
    acceptAndArm(s);

    const wave = waveMobs(sim);
    expect(wave.length).toBe(2);
    wave[0].hp = 0;
    (sim as any).handleDeath(wave[0], player);
    const qp = meta.questLog.get(QUEST_ID)!;
    expect(qp.counts[0]).toBe(1);

    // walk far past the leash — the defense collapses and the count resets
    player.pos.x = point().x + 80;
    sim.tick();
    expect(qp.counts[0]).toBe(0);
    expect(waveMobs(sim).length).toBe(0);

    // returning to the point re-arms a fresh event
    player.pos.x = point().x;
    player.pos.z = point().z;
    sim.tick();
    sim.tick();
    expect(waveMobs(sim).length).toBe(2);
  });

  it('despawns wave attackers when the quest is abandoned', () => {
    const s = world();
    const { sim, pid } = s;
    acceptAndArm(s);
    expect(waveMobs(sim).length).toBe(2);

    sim.abandonQuest(QUEST_ID, pid);
    expect(waveMobs(sim).length).toBe(0);
    sim.tick(); // no event left behind
    expect(waveMobs(sim).length).toBe(0);
  });

  it('slain wave attackers never respawn', () => {
    const s = world();
    const { sim, player } = s;
    acceptAndArm(s);
    const wave = waveMobs(sim);
    const deadId = wave[0].id;
    wave[0].hp = 0;
    (sim as any).handleDeath(wave[0], player);
    // burn well past the corpse + respawn windows (respawnSeconds default 25)
    wave[0].lootable = false;
    for (let i = 0; i < 26 * 20; i++) sim.tick();
    expect(sim.entities.has(deadId)).toBe(false);
  });
});
