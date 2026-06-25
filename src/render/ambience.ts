// Decorative world ambience (birds, butterflies) — render-only, no sim state.

import * as THREE from 'three';
import { TOWN_RADIUS } from '../sim/content/zone1';
import { groundHeight } from '../sim/world';

type CritterKind = 'bird' | 'butterfly';

interface Critter {
  kind: CritterKind;
  mesh: THREE.Sprite;
  base: THREE.Vector3;
  phase: number;
  speed: number;
  radius: number;
  height: number;
}

function makeSprite(color: string, size: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  if (color === '#f5e6a8') {
    ctx.beginPath();
    ctx.ellipse(8, 8, 6, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.lineTo(12, 8);
    ctx.lineTo(8, 14);
    ctx.lineTo(4, 8);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size, 1);
  return sprite;
}

export class WorldAmbience {
  private critters: Critter[] = [];
  private group = new THREE.Group();
  private active = false;
  private seed = 0;

  constructor(scene: THREE.Scene, seed: number) {
    this.seed = seed;
    this.group.name = 'world-ambience';
    scene.add(this.group);
    const rng = (n: number) => ((Math.sin(n * 127.1 + seed) * 43758.5453) % 1 + 1) % 1;
    let i = 0;
    for (let b = 0; b < 6; b++) {
      const x = (rng(i++) - 0.5) * TOWN_RADIUS * 1.4;
      const z = (rng(i++) - 0.5) * TOWN_RADIUS * 1.4;
      const baseY = groundHeight(x, z, seed) + 3 + rng(i++) * 4;
      const mesh = makeSprite('#f5e6a8', 0.35 + rng(i++) * 0.2);
      this.group.add(mesh);
      this.critters.push({
        kind: 'bird',
        mesh,
        base: new THREE.Vector3(x, baseY, z),
        phase: rng(i++) * Math.PI * 2,
        speed: 0.4 + rng(i++) * 0.5,
        radius: 2 + rng(i++) * 3,
        height: baseY,
      });
    }
    for (let f = 0; f < 10; f++) {
      const x = (rng(i++) - 0.5) * TOWN_RADIUS * 1.2;
      const z = (rng(i++) - 0.5) * TOWN_RADIUS * 1.2;
      const y = groundHeight(x, z, seed) + 0.8 + rng(i++) * 1.2;
      const hue = 0.55 + rng(i++) * 0.25;
      const mesh = makeSprite(`hsl(${Math.floor(hue * 360)}, 70%, 65%)`, 0.22 + rng(i++) * 0.12);
      this.group.add(mesh);
      this.critters.push({
        kind: 'butterfly',
        mesh,
        base: new THREE.Vector3(x, y, z),
        phase: rng(i++) * Math.PI * 2,
        speed: 0.8 + rng(i++) * 0.6,
        radius: 0.8 + rng(i++) * 1.2,
        height: y,
      });
    }
  }

  setActive(on: boolean): void {
    if (this.active === on) return;
    this.active = on;
    this.group.visible = on;
  }

  update(time: number): void {
    if (!this.active) return;
    for (const c of this.critters) {
      const t = time * c.speed + c.phase;
      const ox = Math.cos(t) * c.radius;
      const oz = Math.sin(t * 0.7) * c.radius;
      const bob = c.kind === 'bird' ? Math.sin(t * 2.2) * 0.6 : Math.abs(Math.sin(t * 4)) * 0.35;
      c.mesh.position.set(c.base.x + ox, c.height + bob, c.base.z + oz);
      c.mesh.material.opacity = 0.55 + Math.sin(t * 1.3) * 0.25;
    }
  }
}
