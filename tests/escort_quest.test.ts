import { describe, expect, it } from 'vitest';
import { Sim } from '../src/sim/sim';
import { QUESTS } from '../src/sim/data';

describe('escort quests', () => {
  function world() {
    const sim = new Sim({ seed: 7, playerClass: 'warrior', noPlayer: true });
    const pid = sim.addPlayer('warrior', 'Aleph');
    const meta = sim.players.get(pid)!;
    const player = sim.entities.get(meta.entityId)!;
    sim.tick();
    const ents = [...sim.entities.values()];
    const npc = (id: string) => ents.find((e) => e.kind === 'npc' && e.templateId === id);
    return { sim, pid, meta, player, rowan: npc('hunter_rowan'), eliza: npc('innkeeper_eliza') };
  }

  it('spawns an escort NPC on accept and completes at the destination', () => {
    const { sim, pid, meta, player, rowan, eliza } = world();
    meta.questsDone.add('q_scout_pinewood');
    player.pos.x = rowan!.pos.x;
    player.pos.z = rowan!.pos.z;
    sim.acceptQuest('q_escort_to_inn', pid);
    expect(meta.questLog.get('q_escort_to_inn')?.state).toBe('active');

    const escort = [...sim.entities.values()].find(
      (e) => e.kind === 'npc' && e.templateId === 'wounded_scout' && e.escortOwnerId === meta.entityId,
    );
    expect(escort).toBeDefined();

    const dest = QUESTS.q_escort_to_inn.objectives[0].point!;
    player.pos.x = dest.x;
    player.pos.z = dest.z;
    escort!.pos.x = dest.x;
    escort!.pos.z = dest.z;
    sim.tick();
    expect(meta.questLog.get('q_escort_to_inn')?.state).toBe('ready');

    player.pos.x = eliza!.pos.x;
    player.pos.z = eliza!.pos.z;
    sim.turnInQuest('q_escort_to_inn', pid);
    expect(meta.questsDone.has('q_escort_to_inn')).toBe(true);
    expect([...sim.entities.values()].some((e) => e.templateId === 'wounded_scout')).toBe(false);
  });
});

describe('talk-chain quests', () => {
  it('credits talk objectives only in order', () => {
    const sim = new Sim({ seed: 9, playerClass: 'warrior', noPlayer: true });
    const pid = sim.addPlayer('warrior', 'Beta');
    const meta = sim.players.get(pid)!;
    const player = sim.entities.get(meta.entityId)!;
    meta.questsDone.add('q_scout_chapel');
    player.level = 6;
    sim.tick();

    const fenwick = [...sim.entities.values()].find((e) => e.templateId === 'warden_fenwick')!;
    player.pos.x = fenwick.pos.x;
    player.pos.z = fenwick.pos.z;
    sim.acceptQuest('q_fen_courier_chain', pid);
    const qp = meta.questLog.get('q_fen_courier_chain')!;
    expect(qp.state).toBe('active');

    const hale = [...sim.entities.values()].find((e) => e.templateId === 'provisioner_hale')!;
    player.pos.x = hale.pos.x;
    player.pos.z = hale.pos.z;
    sim.talkToNpc(hale.id, pid);
    expect(qp.counts).toEqual([0, 0, 0]);

    const yara = [...sim.entities.values()].find((e) => e.templateId === 'herbalist_yara')!;
    player.pos.x = yara.pos.x;
    player.pos.z = yara.pos.z;
    sim.talkToNpc(yara.id, pid);
    expect(qp.counts[0]).toBe(1);

    const aldric = [...sim.entities.values()].find((e) => e.templateId === 'brother_aldric_fen')!;
    player.pos.x = aldric.pos.x;
    player.pos.z = aldric.pos.z;
    sim.talkToNpc(aldric.id, pid);
    expect(qp.counts[1]).toBe(1);

    player.pos.x = hale.pos.x;
    player.pos.z = hale.pos.z;
    sim.talkToNpc(hale.id, pid);
    expect(qp.counts[2]).toBe(1);
    expect(qp.state).toBe('ready');
  });
});
