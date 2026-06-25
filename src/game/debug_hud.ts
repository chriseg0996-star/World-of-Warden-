import type { IWorld } from '../world_api';
import { xpForLevel, MAX_LEVEL } from '../sim/types';

/** Development-only gameplay stats overlay. Enable with ?debug=1 or localStorage woc_debug=1. */
export class DebugHud {
  readonly enabled: boolean;
  private overlay: HTMLDivElement | null = null;
  private frames = 0;
  private fps = 0;
  private lastFpsAt = 0;

  constructor() {
    const params = new URLSearchParams(location.search);
    this.enabled = params.has('debug') || localStorage.getItem('woc_debug') === '1';
    if (this.enabled) this.mount();
  }

  private mount(): void {
    const el = document.createElement('div');
    el.id = 'debug-hud';
    el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, {
      position: 'fixed',
      top: '8px',
      right: '8px',
      zIndex: '9998',
      padding: '8px 10px',
      font: '12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      color: '#c8f0c8',
      background: 'rgba(8, 12, 8, 0.82)',
      border: '1px solid rgba(120, 200, 120, 0.35)',
      borderRadius: '4px',
      pointerEvents: 'none',
      whiteSpace: 'pre',
      textAlign: 'left',
    });
    document.body.appendChild(el);
    this.overlay = el;
  }

  tick(world: IWorld, now = performance.now()): void {
    if (!this.enabled || !this.overlay) return;
    this.frames++;
    if (now - this.lastFpsAt >= 500) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastFpsAt));
      this.frames = 0;
      this.lastFpsAt = now;
    }

    const p = world.player;
    const invCount = world.inventory.reduce((sum, slot) => sum + slot.count, 0);
    const xpNeed = p.level < MAX_LEVEL ? xpForLevel(p.level) : 0;
    const dmg = `${p.weapon.min}-${p.weapon.max}`;

    this.overlay.textContent = [
      `FPS ${this.fps}`,
      `Pos ${p.pos.x.toFixed(1)}, ${p.pos.z.toFixed(1)}`,
      `HP ${Math.ceil(p.hp)}/${p.maxHp}`,
      `Dmg ${dmg}`,
      `Lv ${p.level}  XP ${world.xp}/${xpNeed}`,
      `Inv ${invCount}`,
    ].join('\n');
  }
}

export function createDebugHud(): DebugHud {
  return new DebugHud();
}
