import * as THREE from 'three';
import { CharacterVisual } from './visual';
import { PlayerClass } from '../../sim/types';
import { loadGltf } from '../assets/loader';
import { assetUrl } from '../assets/media';

/** Classic class colours — used to tint the banner behind the hero. */
const CLASS_COLORS: Record<string, number> = {
  warrior: 0xc79c6e,
  paladin: 0xf58cba,
  hunter: 0xabd473,
  rogue: 0xfff569,
  priest: 0xf0f0f0,
  shaman: 0x2f6fd6,
  mage: 0x69ccf0,
  warlock: 0x9482c9,
  druid: 0xff7d0a,
};

const PREVIEW_ANIM_STATE = {
  speed: 0,
  moving: false,
  airborne: false,
  backwards: false,
  dead: false,
  casting: false,
  swimming: false,
  sitting: false,
};

export class CharacterPreview {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private characterGroup: THREE.Group;
  private envGroup!: THREE.Group;
  private readonly groundY = -0.45;
  private campfireLight: THREE.PointLight | null = null;
  private bannerMat: THREE.MeshStandardMaterial | null = null;
  private currentVisual: CharacterVisual | null = null;
  private currentSkin = 0;
  private clock = new THREE.Clock();
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Drag controls
  private isDragging = false;
  private previousMouseX = 0;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    this.container = container;
    this.canvas = canvas;

    // 1. Initialize WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight, false);
    this.renderer.shadowMap.enabled = false; // Preview doesn't need heavy shadows

    // 2. Initialize Scene
    this.scene = new THREE.Scene();

    // Dusky Eastbrook Vale at golden hour: a vertical gradient sky (deep navy
    // overhead melting into a warm sunset horizon) plus tight navy-tinted fog so
    // the village treeline reads as a soft, hazy backdrop rather than a flat sky.
    this.scene.background = this.makeSkyTexture();
    this.scene.fog = new THREE.Fog(0x33384f, 11, 30);

    // 3. Initialize Camera — framed so the hero is large and prominent on the
    //    carved pedestal with the village clearing around them.
    const aspect = this.container.clientHeight > 0
      ? this.container.clientWidth / this.container.clientHeight
      : 1;
    this.camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 200);
    this.camera.position.set(0.45, 1.78, 5.1);
    this.camera.lookAt(new THREE.Vector3(0, 1.2, 0));

    // 4. Initialize Character Group
    this.characterGroup = new THREE.Group();
    this.scene.add(this.characterGroup);

    // 5. Dusk lighting: dim cool ambient, a low warm sunset key, a dedicated
    //    front fill that keeps the hero crisp and bright, and a cool back rim.
    const hemiLight = new THREE.HemisphereLight(0x5b6aa0, 0x3a2e22, 0.55);
    this.scene.add(hemiLight);
    const sun = new THREE.DirectionalLight(0xffb066, 1.2);
    sun.position.set(6, 3.5, 4);
    this.scene.add(sun);
    const heroKey = new THREE.DirectionalLight(0xfff0d8, 1.55);
    heroKey.position.set(1.5, 4, 6);
    this.scene.add(heroKey);
    const rim = new THREE.DirectionalLight(0x6a7cb0, 0.5);
    rim.position.set(-4, 4, -4);
    this.scene.add(rim);

    // 5b. Build the cozy Eastbrook Vale diorama (ground, pedestal, campfire,
    //     village props) behind the live character.
    this.buildEnvironment();

    // 6. Setup Drag Controls
    this.setupDragControls();

    // 7. Setup Resize Observer
    this.setupResizeObserver();

    // 8. Start loop
    this.animate();
  }

  /** Build the cozy daytime Eastbrook Vale diorama around the character. */
  private buildEnvironment(): void {
    this.envGroup = new THREE.Group();
    this.scene.add(this.envGroup);
    const gY = this.groundY;

    // Grass clearing (dusk-muted green).
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(45, 48),
      new THREE.MeshStandardMaterial({ color: 0x3c4a2c, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = gY;
    this.envGroup.add(ground);

    // Dirt patch under the pedestal.
    const path = new THREE.Mesh(
      new THREE.CircleGeometry(3.1, 40),
      new THREE.MeshStandardMaterial({ color: 0x4f3f2b, roughness: 1 }),
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, gY + 0.01, 0.3);
    this.envGroup.add(path);

    // Carved stone pedestal: a wide stepped footing, a stacked drum, a runed
    // mid-band that glows faintly at dusk, and a bevelled cap. The top surface
    // sits at y = 0 so the character (placed at the origin) stands on it.
    const stoneTop = new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.9 });
    const stoneBase = new THREE.MeshStandardMaterial({ color: 0x6e685d, roughness: 0.95 });
    const footing = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.06, 0.13, 44), stoneBase);
    footing.position.y = gY + 0.065;
    this.envGroup.add(footing);
    const baseDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.78, 0.22, 36), stoneBase);
    baseDrum.position.y = gY + 0.11;
    this.envGroup.add(baseDrum);
    // Runed band wrapping the drum — emissive glyphs catch the firelight.
    const runeBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.63, 1.66, 0.16, 48, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x645e54, roughness: 0.85,
        emissive: 0xffb45a, emissiveMap: this.makeRuneTexture(), emissiveIntensity: 0.85,
      }),
    );
    runeBand.position.y = gY + 0.16;
    this.envGroup.add(runeBand);
    const topDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.46, 0.26, 36), stoneTop);
    topDrum.position.y = gY + 0.22 + 0.13;
    this.envGroup.add(topDrum);
    const capBevel = new THREE.Mesh(new THREE.CylinderGeometry(1.34, 1.38, 0.06, 36), stoneTop);
    capBevel.position.y = gY + 0.48;
    this.envGroup.add(capBevel);

    // Class banner: a tall cloth slung between two posts behind the hero. Its
    // colour is set per class in setClass().
    const postMat = new THREE.MeshStandardMaterial({ color: 0x4a3b2a, roughness: 0.85 });
    const postGeo = new THREE.CylinderGeometry(0.05, 0.06, 3.5, 12);
    const postL = new THREE.Mesh(postGeo, postMat); postL.position.set(-0.95, gY + 1.75, -1.75);
    const postR = new THREE.Mesh(postGeo, postMat); postR.position.set(0.95, gY + 1.75, -1.75);
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.15, 12), postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, gY + 3.2, -1.75);
    this.bannerMat = new THREE.MeshStandardMaterial({
      color: CLASS_COLORS.warrior, roughness: 0.72, metalness: 0.0, side: THREE.DoubleSide,
    });
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.5), this.bannerMat);
    cloth.position.set(0, gY + 1.9, -1.71);
    const emblem = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.055, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0xe8c878, metalness: 0.45, roughness: 0.5, emissive: 0x342710 }),
    );
    emblem.position.set(0, gY + 2.05, -1.65);
    this.envGroup.add(postL, postR, crossbar, cloth, emblem);

    // Distant village backdrop: a fogged treeline ring + a couple of cottages so
    // the horizon reads as Eastbrook Vale rather than empty sky.
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x222a39, roughness: 1 });
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const z = Math.cos(a) * (14 + (i % 3) * 1.7) - 2.5;
      if (z > 5.5) continue; // keep the front clearing open toward the camera
      const x = Math.sin(a) * (14 + (i % 3) * 1.7);
      const h = 3.2 + (i % 4) * 0.95;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.85 + (i % 3) * 0.2, h, 7), treeMat);
      cone.position.set(x, gY + h / 2, z);
      this.envGroup.add(cone);
    }
    const houseMat = new THREE.MeshStandardMaterial({ color: 0x2b2933, roughness: 1 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a2330, roughness: 1 });
    const mkHouse = (hx: number, hz: number, s: number): void => {
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4 * s, 1.6 * s, 2 * s), houseMat);
      body.position.set(hx, gY + 0.8 * s, hz);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.9 * s, 1.2 * s, 4), roofMat);
      roof.position.set(hx, gY + 1.6 * s + 0.6 * s, hz);
      roof.rotation.y = Math.PI / 4;
      this.envGroup.add(body, roof);
    };
    mkHouse(-9.5, -6.5, 1.1);
    mkHouse(10, -7.5, 1.25);

    // Warm campfire light (bonfire prop loads in below).
    this.campfireLight = new THREE.PointLight(0xff8a36, 2.6, 11, 2);
    this.campfireLight.position.set(-2.1, gY + 0.5, 1.7);
    this.envGroup.add(this.campfireLight);

    // Cozy lantern glows by the inn and the blacksmith forge.
    const innLantern = new THREE.PointLight(0xffcf87, 1.1, 8, 2);
    innLantern.position.set(4.6, gY + 1.6, -2.2);
    this.envGroup.add(innLantern);
    const forgeGlow = new THREE.PointLight(0xff9a4a, 1.0, 7, 2);
    forgeGlow.position.set(-4.4, gY + 1.1, -1.9);
    this.envGroup.add(forgeGlow);

    // Village props (auto-scaled by bounding box, seated on the ground, turned
    // toward the centre). Any that fail to load simply leave the clearing emptier.
    this.addProp('/models/props/bonfire.glb', { x: -2.1, z: 1.7, h: 0.9 });
    this.addProp('/models/props/blacksmith.glb', { x: -4.7, z: -2.2, h: 3.1, yaw: 0.5 });
    this.addProp('/models/props/anvil.glb', { x: -2.9, z: -0.5, h: 0.95, yaw: 0.6 });
    this.addProp('/models/props/inn.glb', { x: 5.3, z: -2.6, h: 3.6, yaw: -0.6 });
    this.addProp('/models/props/market_stand_1.glb', { x: 3.5, z: 0.5, h: 1.9, yaw: -1.0 });
    this.addProp('/models/props/well.glb', { x: 2.3, z: -3.4, h: 1.6 });
    this.addProp('/models/props/cart.glb', { x: -3.7, z: 1.3, h: 1.2, yaw: 0.4 });
    this.addProp('/models/props/barrel.glb', { x: 1.7, z: 1.5, h: 0.7 });
    this.addProp('/models/foliage/oak_1.glb', { x: 6.2, z: -1.0, h: 4.6 });
    this.addProp('/models/foliage/oak_3.glb', { x: -6.4, z: 0.4, h: 4.2 });
    this.addProp('/models/foliage/pine_2.glb', { x: 4.6, z: -5.2, h: 5.2 });
    this.addProp('/models/foliage/pine_4.glb', { x: -5.2, z: -4.6, h: 4.8 });
    this.addProp('/models/foliage/bush.glb', { x: 2.0, z: 2.1, h: 0.55 });
    this.addProp('/models/foliage/bush_flowers.glb', { x: -1.4, z: 2.3, h: 0.55 });
    this.addProp('/models/foliage/rock_2.glb', { x: 2.7, z: 1.9, h: 0.5 });
  }

  /** Vertical dusk gradient used as the sky background. */
  private makeSkyTexture(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 8; c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0, '#1a2138');
    g.addColorStop(0.5, '#2b3450');
    g.addColorStop(0.74, '#574a63');
    g.addColorStop(0.86, '#9c6f52');
    g.addColorStop(0.95, '#caa46a');
    g.addColorStop(1.0, '#7c5a3e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 8, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Black field with glowing rune glyphs — used as the pedestal band emissiveMap. */
  private makeRuneTexture(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 64;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1024, 64);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const glyphs = 24;
    for (let i = 0; i < glyphs; i++) {
      const cx = (i + 0.5) * (1024 / glyphs);
      const dir = (i % 2) ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cx, 14); ctx.lineTo(cx, 50);
      ctx.moveTo(cx, 22); ctx.lineTo(cx + 8 * dir, 16);
      ctx.moveTo(cx, 42); ctx.lineTo(cx - 8 * dir, 48);
      if (i % 3 === 0) { ctx.moveTo(cx - 7, 32); ctx.lineTo(cx + 7, 32); }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(3, 1);
    return tex;
  }

  /** Load a GLB, scale it to a target height by bounding box, and seat it on the ground at (x,z). */
  private addProp(url: string, opts: { x: number; z: number; h: number; yaw?: number }): void {
    loadGltf(assetUrl(url)).then((gltf) => {
      const obj = gltf.scene.clone(true);
      let box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      obj.scale.setScalar(opts.h / Math.max(0.001, size.y));
      box = new THREE.Box3().setFromObject(obj);
      const c = new THREE.Vector3();
      box.getCenter(c);
      obj.position.set(opts.x - c.x, this.groundY - box.min.y, opts.z - c.z);
      if (opts.yaw) obj.rotation.y = opts.yaw;
      obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; }
      });
      if (this.envGroup) this.envGroup.add(obj);
    }).catch(() => { /* missing prop: leave the clearing emptier */ });
  }

  /** Set the active character model by player class. */
  setClass(cls: PlayerClass): void {
    // Clean up current visual if it exists
    if (this.currentVisual) {
      this.characterGroup.remove(this.currentVisual.root);
      // CharacterVisual dispose only releases mixer listeners
      this.currentVisual = null;
    }

    try {
      // Load the CharacterVisual from preloaded assets (e.g. player_warrior)
      const visualKey = `player_${cls}`;
      this.currentVisual = new CharacterVisual(visualKey, 0xffffff, this.currentSkin);
      this.characterGroup.add(this.currentVisual.root);

      // Tint the banner behind the hero to the class colour.
      if (this.bannerMat) this.bannerMat.color.setHex(CLASS_COLORS[cls] ?? CLASS_COLORS.warrior);

      // Reset rotation of group so new character faces forward but holds any user offset if preferred.
      // Resetting Y rotation is cleanest for transitions.
      this.characterGroup.rotation.y = 0;
    } catch (err) {
      console.error(`Failed to load preview character visual for ${cls}:`, err);
    }
  }

  /** Swap the previewed skin (alternate body texture); persists across setClass. */
  setSkin(skinIndex: number): void {
    this.currentSkin = skinIndex;
    this.currentVisual?.setSkin(skinIndex);
  }

  /** Dynamically shift the canvas to a new container */
  setContainer(container: HTMLElement): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.container = container;
    this.container.appendChild(this.canvas);

    // Initial resize sync
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width > 0 && height > 0) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    // Re-observe the new container
    this.setupResizeObserver();
  }

  private setupDragControls(): void {
    const onMouseDown = (e: MouseEvent) => {
      this.isDragging = true;
      this.previousMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMouseX;
      this.characterGroup.rotation.y += deltaX * 0.01;
      this.previousMouseX = e.clientX;
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMouseX = e.touches[0].clientX;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMouseX;
      this.characterGroup.rotation.y += deltaX * 0.01;
      this.previousMouseX = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    this.canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width > 0 && height > 0) {
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1); // cap dt to prevent huge jumps

    // Campfire flicker.
    if (this.campfireLight) {
      const t = this.clock.elapsedTime;
      this.campfireLight.intensity = 2.6 + Math.sin(t * 11) * 0.35 + Math.sin(t * 19) * 0.18;
    }

    // Auto-rotation if prefers-reduced-motion is false and not dragging
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReducedMotion && !this.isDragging) {
      this.characterGroup.rotation.y += 0.35 * dt; // Slow rotation: ~0.35 rad per sec
    }

    // Update animations inside visual
    if (this.currentVisual) {
      this.currentVisual.update(dt, PREVIEW_ANIM_STATE, true);
    }

    this.renderer.render(this.scene, this.camera);
  };

  /** Cleanup resources */
  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.currentVisual) {
      this.characterGroup.remove(this.currentVisual.root);
      this.currentVisual = null;
    }

    // Clean up event listeners is handled by window/document GC or manual tracking if necessary,
    // but canvas event listeners are garbage collected when canvas is removed.
    // Window listeners need explicit removal to avoid memory leaks:
    // However, since we keep a single canvas alive and move it, we don't destroy often.
  }
}
