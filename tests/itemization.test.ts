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

  it('activates the Wolf Runner set from Eastbrook quest gear', () => {
    const sim = makeSim();
    const pid = sim.addPlayer('rogue', 'Scout');
    sim.tick();
    const e = sim.entities.get(pid)!;
    const meta = sim.players.get(pid)!;

    (sim as any).addItemSilent('wolfhide_gloves', 1, meta);
    sim.equipItem('wolfhide_gloves', pid);
    const agiAt1 = e.stats.agi;
    expect(e.stats.crit ?? 0).toBe(0);

    (sim as any).addItemSilent('wolf_runner_boots', 1, meta);
    const agiBeforeBoots = e.stats.agi;
    sim.equipItem('wolf_runner_boots', pid);
    expect(e.stats.agi).toBe(agiBeforeBoots + 4 + 1); // 2-set bonus + boots stat

    (sim as any).addItemSilent('road_scout_coif', 1, meta);
    const critBeforeCoif = e.critChance;
    sim.equipItem('road_scout_coif', pid);
    expect(e.critChance).toBeCloseTo(critBeforeCoif + 0.01, 5);
  });

  it('activates the Fenwalker set from Mirefen vendor gear', () => {
    const sim = makeSim();
    const pid = sim.addPlayer('warrior', 'Fen');
    sim.tick();
    const e = sim.entities.get(pid)!;
    const meta = sim.players.get(pid)!;

    (sim as any).addItemSilent('reedwoven_trousers', 1, meta);
    sim.equipItem('reedwoven_trousers', pid);
    const staAt1 = e.stats.sta;
    const spiAt1 = e.stats.spi;

    (sim as any).addItemSilent('fenwalker_boots', 1, meta);
    sim.equipItem('fenwalker_boots', pid);
    expect(e.stats.sta).toBe(staAt1 + 4);
    expect(e.stats.spi).toBe(spiAt1);

    (sim as any).addItemSilent('reedwoven_jerkin', 1, meta);
    sim.equipItem('reedwoven_jerkin', pid);
    expect(e.stats.spi).toBe(spiAt1 + 2);
  });
});

describe('itemization: trinkets', () => {
  it('on-use trinket grants its buff and respects its cooldown', () => {
    const sim = makeSim();
    const pid = sim.addPlayer('warrior', 'Aleph');
    sim.tick();
    const e = sim.entities.get(pid)!;
    const meta = sim.players.get(pid)!;
    (sim as any).addItemSilent('recruits_hourglass', 1, meta);
    sim.equipItem('recruits_hourglass', pid);
    expect(meta.equipment.trinket).toBe('recruits_hourglass');

    const apBefore = e.attackPower;
    sim.useItem('recruits_hourglass', pid); // +30 AP for 12s
    expect(e.auras.some((a) => a.id === 'trinket:recruits_hourglass')).toBe(true);
    expect(e.attackPower).toBe(apBefore + 30);

    // second activation is blocked by the cooldown (no second aura/stack)
    sim.useItem('recruits_hourglass', pid);
    const err = sim.tick().find((ev) => ev.type === 'error');
    expect(err && err.type === 'error' ? err.text : '').toMatch(/not ready/i);
    expect(e.auras.filter((a) => a.id === 'trinket:recruits_hourglass').length).toBe(1);
  });

  it('on-use trinket cannot be activated from the bags (must be equipped)', () => {
    const sim = makeSim();
    const pid = sim.addPlayer('warrior', 'Aleph');
    sim.tick();
    const e = sim.entities.get(pid)!;
    const meta = sim.players.get(pid)!;
    (sim as any).addItemSilent('recruits_hourglass', 1, meta);
    sim.useItem('recruits_hourglass', pid); // not equipped -> equips instead of activating
    expect(meta.equipment.trinket).toBe('recruits_hourglass');
    expect(e.auras.some((a) => a.id === 'trinket:recruits_hourglass')).toBe(false);
  });

  it('proc trinket fires on melee hits deterministically (same seed ⇒ same procs)', () => {
    const run = () => {
      const sim = new Sim({ seed: 7, playerClass: 'warrior', noPlayer: true });
      const pid = sim.addPlayer('warrior', 'Aleph');
      sim.tick();
      const e = sim.entities.get(pid)!;
      const meta = sim.players.get(pid)!;
      (sim as any).addItemSilent('coin_of_fortune', 1, meta);
      sim.equipItem('coin_of_fortune', pid);
      // drive a long series of connecting auto-attacks against a dummy
      let procs = 0;
      for (let i = 0; i < 400; i++) {
        (sim as any).rollGearProcs(e);
        if (e.auras.some((a) => a.id === 'proc:coin_of_fortune')) procs++;
        e.auras = e.auras.filter((a: any) => a.id !== 'proc:coin_of_fortune');
      }
      return procs;
    };
    const a = run();
    const b = run();
    expect(a).toBe(b);          // deterministic
    expect(a).toBeGreaterThan(0); // ~10% of 400 should fire
    expect(a).toBeLessThan(120);
  });
});
