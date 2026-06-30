import { describe, expect, it } from 'vitest';
import { playerSwingInterval, showsSwingTimer, swingIntervalMult } from '../src/sim/entity';
import type { Entity } from '../src/sim/types';

function stubEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    id: 1,
    kind: 'player',
    templateId: '',
    name: 'Test',
    level: 1,
    pos: { x: 0, y: 0, z: 0 },
    prevPos: { x: 0, y: 0, z: 0 },
    facing: 0,
    prevFacing: 0,
    vx: 0,
    vz: 0,
    vy: 0,
    onGround: true,
    fallStartY: 0,
    hp: 100,
    maxHp: 100,
    resource: 0,
    maxResource: 100,
    resourceType: 'rage',
    overheadEmoteId: null,
    overheadEmoteUntil: 0,
    overheadEmoteSeq: 0,
    stats: { str: 10, agi: 10, sta: 10, int: 10, spi: 10, armor: 0 },
    weapon: { min: 5, max: 8, speed: 2.4 },
    attackPower: 10,
    rangedPower: 0,
    critChance: 0.05,
    dodgeChance: 0.05,
    moveSpeed: 7,
    hostile: false,
    targetId: null,
    autoAttack: false,
    swingTimer: 0,
    inCombat: false,
    combatTimer: 99,
    auras: [],
    ccDr: new Map(),
    castingAbility: null,
    castRemaining: 0,
    castTotal: 0,
    channeling: false,
    channelTickTimer: 0,
    channelTickEvery: 0,
    gcdRemaining: 0,
    cooldowns: new Map(),
    queuedOnSwing: null,
    fiveSecondRule: 99,
    comboPoints: 0,
    comboTargetId: null,
    overpowerUntil: -1,
    potionCooldownUntil: -1,
    savedMana: 0,
    chargeTargetId: null,
    chargeTimeLeft: 0,
    chargePath: [],
    followTargetId: null,
    sitting: false,
    eating: null,
    drinking: null,
    aiState: 'idle',
    tappedById: null,
    pulseTimer: 0,
    stompTimer: 0,
    firedSummons: 0,
    summonedIds: [],
    enraged: false,
    healedThisPull: false,
    threat: new Map(),
    forcedTargetId: null,
    forcedTargetTimer: 0,
    ownerId: null,
    petMode: 'defensive',
    petTauntTimer: 0,
    spawnPos: { x: 0, y: 0, z: 0 },
    leashAnchor: null,
    evadeStall: 0,
    fleeTimer: 0,
    hasFled: false,
    wanderTarget: null,
    wanderTimer: 0,
    aggroTargetId: null,
    respawnTimer: 0,
    corpseTimer: 0,
    lootable: false,
    loot: null,
    xpValue: 0,
    questIds: [],
    vendorItems: [],
    objectItemId: null,
    dungeonId: null,
    dead: false,
    scale: 1,
    color: 0xffffff,
    skin: 0,
    ...overrides,
  };
}

describe('swing timer helpers', () => {
  it('shows swing timer for melee and hybrid classes, not pure casters', () => {
    expect(showsSwingTimer('warrior')).toBe(true);
    expect(showsSwingTimer('hunter')).toBe(true);
    expect(showsSwingTimer('mage')).toBe(false);
    expect(showsSwingTimer('priest')).toBe(false);
    expect(showsSwingTimer('warlock')).toBe(false);
  });

  it('applies attack-speed slows and haste to the interval', () => {
    const slow = stubEntity({ auras: [{ id: 'slow', name: 'Slow', kind: 'attackspeed', remaining: 5, duration: 5, value: 1.5, sourceId: 0, school: 'physical' }] });
    const haste = stubEntity({ auras: [{ id: 'haste', name: 'Haste', kind: 'buff_haste', remaining: 5, duration: 5, value: 1.3, sourceId: 0, school: 'physical' }] });
    expect(swingIntervalMult(slow)).toBeCloseTo(1.5);
    expect(swingIntervalMult(haste)).toBeCloseTo(1 / 1.3);
    expect(playerSwingInterval(stubEntity(), 'warrior')).toBeCloseTo(2.4);
    expect(playerSwingInterval(slow, 'warrior')).toBeCloseTo(2.4 * 1.5);
  });

  it('uses hunter ranged speed for auto-shot interval', () => {
    expect(playerSwingInterval(stubEntity({ weapon: { min: 5, max: 8, speed: 2.0 } }), 'hunter')).toBeCloseTo(2.3);
  });
});
