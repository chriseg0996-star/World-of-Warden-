import { describe, expect, it } from 'vitest';
import { Sim } from '../src/sim/sim';
import { recalcPlayerStats } from '../src/sim/entity';
import { EQUIP_SLOTS } from '../src/sim/types';

const makeSim = () => new Sim({ seed: 42, playerClass: 'warrior', noPlayer: true });

describe('itemization: expanded equipment slots', () => {
  it('defines 14 ordered equip slots including the new ones', () => {
    expect(EQUIP_SLOTS.length).toBe(14);
    for (const s of ['head', 'neck', 'shoulder', 'back', 'wrist', 'hands', 'waist', 'ring1', 'ring2', 'trinket']) {
      expect(EQUIP_SLOTS).toContain(s);
    }
    // the original four still exist
    for (const s of ['mainhand', 'chest', 'legs', 'feet']) expect(EQUIP_SLOTS).toContain(s);
  });

  it('equipping a new-slot item adds its stats to the entity (no power change otherwise)', () => {
    const sim = makeSim();
    const pid = sim.addPlayer('warrior', 'Aleph');
    sim.tick();
    const e = sim.entities.get(pid)!;
    const meta = sim.players.get(pid)!;
    const armorBefore = e.stats.armor;
    (sim as any).addItemSilent('worn_leather_cap', 1, meta); // head, +10 armor
    sim.equipItem('worn_leather_cap', pid);
    expect(meta.equipment.head).toBe('worn_leather_cap');
    expect(e.stats.armor).toBe(armorBefore + 10);
  });

  it('routes a second ring to the open ring2 slot', () => {
    const sim = makeSim();
    const pid = sim.addPlayer('warrior', 'Aleph');
    sim.tick();
    const meta = sim.players.get(pid)!;
    (sim as any).addItemSilent('copper_band', 2, meta);
    sim.equipItem('copper_band', pid);
    expect(meta.equipment.ring1).toBe('copper_band');
    expect(meta.equipment.ring2).toBeUndefined();
    sim.equipItem('copper_band', pid);
    expect(meta.equipment.ring2).toBe('copper_band');
  });

  it('persists new-slot equipment across a serialize/deserialize round-trip', () => {
    const sim = makeSim();
    const pid = sim.addPlayer('warrior', 'Aleph');
    sim.tick();
    const meta = sim.players.get(pid)!;
    (sim as any).addItemSilent('rough_spaulders', 1, meta);
    sim.equipItem('rough_spaulders', pid);
    const state = sim.serializeCharacter(pid)!;
    expect(state.equipment!.shoulder).toBe('rough_spaulders');

    const sim2 = makeSim();
    const pid2 = sim2.addPlayer('warrior', 'Reload', { state });
    sim2.tick();
    expect(sim2.players.get(pid2)!.equipment.shoulder).toBe('rough_spaulders');
  });
});

describe('itemization: set bonuses', () => {
  it('activates set tiers at piece thresholds and recedes when a piece is removed', () => {
    const sim = makeSim();
    const pid = sim.addPlayer('warrior', 'Aleph');
    sim.tick();
    const e = sim.entities.get(pid)!;
    const meta = sim.players.get(pid)!;
    const baseSta = e.stats.sta;
    const baseStr = e.stats.str;

    // 1 piece (head): no set tier yet (cap grants no sta)
    (sim as any).addItemSilent('worn_leather_cap', 1, meta);
    sim.equipItem('worn_leather_cap', pid);
    expect(e.stats.sta).toBe(baseSta);

    // 2 pieces: 2-set tier (+3 stamina) activates; 3-set (+str) not yet
    (sim as any).addItemSilent('rough_spaulders', 1, meta);
    sim.equipItem('rough_spaulders', pid);
    expect(e.stats.sta).toBe(baseSta + 3);
    expect(e.stats.str).toBe(baseStr);
    const armorAt2 = e.stats.armor;

    // 3 pieces: 3-set tier (+8 armor, +2 str) adds on top of the 2-set tier
    (sim as any).addItemSilent('patched_cloak', 1, meta);
    sim.equipItem('patched_cloak', pid);
    expect(e.stats.sta).toBe(baseSta + 3);
    expect(e.stats.str).toBe(baseStr + 2);
    expect(e.stats.armor).toBe(armorAt2 + 5 /* cloak armor */ + 8 /* 3-set bonus */);

    // removing the cloak drops the 3-set tier but keeps the 2-set tier
    meta.equipment.back = undefined;
    recalcPlayerStats(e, meta.cls, meta.equipment, meta.talentMods);
    expect(e.stats.str).toBe(baseStr);
    expect(e.stats.sta).toBe(baseSta + 3);
  });
});
