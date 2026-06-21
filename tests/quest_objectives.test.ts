// Phase 4a: new quest objective types 'talk' (speak to a target NPC) and
// 'explore' (reach a location). Both live entirely in the deterministic sim
// core (src/sim/sim.ts) like the existing 'kill'/'collect' handlers.
//
// These tests register synthetic QuestDefs in the global QUESTS table. Vitest
// isolates each test file's module graph, so the additions never leak into
// other suites; we also remove them after each test for hygiene.
import { afterEach, describe, expect, it } from 'vitest';
import { Sim } from '../src/sim/sim';
import { QUESTS } from '../src/sim/data';
import { QuestDef, QuestObjective } from '../src/sim/types';

const SYNTHETIC: string[] = [];

function registerQuest(id: string, objectives: QuestObjective[]): void {
  (QUESTS as Record<string, QuestDef>)[id] = {
    id, name: `Test ${id}`, giverNpcId: 'nobody', turnInNpcId: 'nobody',
    text: '', completionText: '', objectives, xpReward: 100, copperReward: 0, itemRewards: {},
  };
  SYNTHETIC.push(id);
}

afterEach(() => {
  while (SYNTHETIC.length) delete (QUESTS as Record<string, QuestDef>)[SYNTHETIC.pop()!];
});

function makeSim() {
  const sim = new Sim({ seed: 42, playerClass: 'warrior', noPlayer: true });
  const pid = sim.addPlayer('warrior', 'Aleph');
  const meta = sim.players.get(pid)!;
  const player = (sim as unknown as { entities: Map<number, { pos: { x: number; z: number } }> })
    .entities.get(meta.entityId)!;
  sim.tick();
  return { sim, pid, meta, player };
}

describe("'talk' quest objective", () => {
  it('credits and completes only when the player speaks to the target NPC', () => {
    const { sim, meta } = makeSim();
    registerQuest('t_talk', [{ type: 'talk', targetNpcId: 'marshal_redbrook', count: 1, label: 'Speak to the Marshal' }]);
    meta.questLog.set('t_talk', { questId: 't_talk', counts: [0], state: 'active' });

    // Talking to the wrong NPC does nothing.
    (sim as any).onNpcTalkedToForQuests('apothecary_lin', meta);
    expect(meta.questLog.get('t_talk')!.counts[0]).toBe(0);

    // Talking to the target credits the objective and flips the quest to ready.
    (sim as any).onNpcTalkedToForQuests('marshal_redbrook', meta);
    const qp = meta.questLog.get('t_talk')!;
    expect(qp.counts[0]).toBe(1);
    expect(qp.state).toBe('ready');

    // Talking again does not over-credit past the target count.
    (sim as any).onNpcTalkedToForQuests('marshal_redbrook', meta);
    expect(meta.questLog.get('t_talk')!.counts[0]).toBe(1);
  });

  it('credits through the public talkToNpc interaction path', () => {
    const { sim, pid, meta } = makeSim();
    const npc = [...(sim as any).entities.values()].find((e: any) => e.kind === 'npc');
    expect(npc).toBeTruthy();
    registerQuest('t_talk2', [{ type: 'talk', targetNpcId: npc.templateId, count: 1, label: 'Speak' }]);
    meta.questLog.set('t_talk2', { questId: 't_talk2', counts: [0], state: 'active' });

    sim.talkToNpc(npc.id, pid);
    expect(meta.questLog.get('t_talk2')!.counts[0]).toBe(1);
  });
});

describe("'explore' quest objective", () => {
  it('credits only inside the discovery radius and then completes', () => {
    const { sim, meta, player } = makeSim();
    const point = { x: player.pos.x + 100, z: player.pos.z + 100 };
    registerQuest('t_explore', [{ type: 'explore', point, radius: 10, count: 1, label: 'Find the ruin' }]);
    meta.questLog.set('t_explore', { questId: 't_explore', counts: [0], state: 'active' });

    // Outside the radius: no credit.
    player.pos.x = point.x + 50; player.pos.z = point.z;
    (sim as any).updateExploreObjectives(player, meta);
    expect(meta.questLog.get('t_explore')!.counts[0]).toBe(0);

    // Inside the radius (~6.7 yds < 10): credited and ready.
    player.pos.x = point.x + 6; player.pos.z = point.z - 3;
    (sim as any).updateExploreObjectives(player, meta);
    const qp = meta.questLog.get('t_explore')!;
    expect(qp.counts[0]).toBe(1);
    expect(qp.state).toBe('ready');
  });

  it('is credited by the per-tick update when standing in the area', () => {
    const { sim, meta, player } = makeSim();
    const point = { x: player.pos.x, z: player.pos.z }; // already standing on the spot
    registerQuest('t_explore2', [{ type: 'explore', point, count: 1, label: 'Arrive' }]);
    meta.questLog.set('t_explore2', { questId: 't_explore2', counts: [0], state: 'active' });

    sim.tick();
    expect(meta.questLog.get('t_explore2')!.counts[0]).toBe(1);
  });

  it('falls back to the default discovery radius when none is given', () => {
    const { sim, meta, player } = makeSim();
    const point = { x: player.pos.x, z: player.pos.z };
    registerQuest('t_explore3', [{ type: 'explore', point, count: 1, label: 'Here' }]); // no radius
    meta.questLog.set('t_explore3', { questId: 't_explore3', counts: [0], state: 'active' });

    player.pos.x = point.x + 8; player.pos.z = point.z; // 8 yds < default 12
    (sim as any).updateExploreObjectives(player, meta);
    expect(meta.questLog.get('t_explore3')!.counts[0]).toBe(1);
  });

  it('only affects active quests, never ready/done ones', () => {
    const { sim, meta, player } = makeSim();
    const point = { x: player.pos.x, z: player.pos.z };
    registerQuest('t_explore4', [{ type: 'explore', point, count: 1, label: 'Here' }]);
    meta.questLog.set('t_explore4', { questId: 't_explore4', counts: [0], state: 'ready' });

    (sim as any).updateExploreObjectives(player, meta);
    // Already-ready quests are skipped; counts untouched.
    expect(meta.questLog.get('t_explore4')!.counts[0]).toBe(0);
  });
});

// Phase 4b: the first shipped quests that use the new objective types, in
// Eastbrook Vale. Driven through the real world (real NPCs, real positions).
describe('Phase 4b Eastbrook Vale content', () => {
  function world() {
    const sim = new Sim({ seed: 7, playerClass: 'warrior', noPlayer: true });
    const pid = sim.addPlayer('warrior', 'Aleph');
    const meta = sim.players.get(pid)!;
    const player = (sim as any).entities.get(meta.entityId);
    sim.tick();
    const ents = [...(sim as any).entities.values()];
    const npc = (id: string) => ents.find((e: any) => e.kind === 'npc' && e.templateId === id);
    return { sim, pid, meta, player, marshal: npc('marshal_redbrook'), lin: npc('apothecary_lin') };
  }

  it('ships q_word_with_lin (talk) and q_scout_pinewood (explore) wired to NPCs', () => {
    expect(QUESTS.q_word_with_lin.objectives[0].type).toBe('talk');
    expect(QUESTS.q_word_with_lin.objectives[0].targetNpcId).toBe('apothecary_lin');
    expect(QUESTS.q_word_with_lin.giverNpcId).toBe('marshal_redbrook');
    expect(QUESTS.q_word_with_lin.turnInNpcId).toBe('apothecary_lin');
    expect(QUESTS.q_scout_pinewood.objectives[0].type).toBe('explore');
    expect(QUESTS.q_scout_pinewood.objectives[0].point).toEqual({ x: -6, z: 40 });
  });

  it('completes the explore quest by reaching the scout point', () => {
    const { sim, pid, meta, player, marshal } = world();
    player.pos.x = marshal.pos.x; player.pos.z = marshal.pos.z;
    sim.acceptQuest('q_scout_pinewood', pid);
    expect(meta.questLog.get('q_scout_pinewood')?.state).toBe('active');

    const point = QUESTS.q_scout_pinewood.objectives[0].point!;
    player.pos.x = point.x; player.pos.z = point.z;
    sim.tick();
    expect(meta.questLog.get('q_scout_pinewood')?.state).toBe('ready');
  });

  it('completes and turns in the talk quest by speaking to Apothecary Lin', () => {
    const { sim, pid, meta, player, marshal, lin } = world();
    player.pos.x = marshal.pos.x; player.pos.z = marshal.pos.z;
    sim.acceptQuest('q_word_with_lin', pid);
    expect(meta.questLog.get('q_word_with_lin')?.state).toBe('active');

    // Talking to Lin (the turn-in NPC) both credits the talk objective and turns it in.
    player.pos.x = lin.pos.x; player.pos.z = lin.pos.z;
    sim.talkToNpc(lin.id, pid);
    expect(meta.questLog.has('q_word_with_lin')).toBe(false);
    expect(meta.questsDone.has('q_word_with_lin')).toBe(true);
  });
});
