import * as THREE from 'three';
import { CharacterVisual } from './visual';
import { PlayerClass } from '../../sim/types';
import { loadGltf } from '../assets/loader';
import { assetUrl } from '../assets/media';

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

    // Dusky Eastbrook Vale at golden hour: deep navy sky and tight, navy-tinted
    // fog so the village reads as a soft, hazy backdrop rather than a flat sky.
    this.scene.background = new THREE.Color(0x2b3450);
    this.scene.fog = new THREE.Fog(0x2b3450, 10, 26);

    // 3. Initialize Camera — pulled back/up so the hero reads small and fully
    //    visible on the pedestal with the village clearing around them.
    const aspect = this.container.clientHeight > 0
      ? this.container.clientWidth / this.container.clientHeight
      : 1;
    this.camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 200);
    this.camera.position.set(0.55, 1.8, 6.3);
    this.camera.lookAt(new THREE.Vector3(0, 1.0, 0));

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
    const heroKey = new THREE.DirectionalLight(0xfff0d8, 1.15);
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

    // Stone pedestal (two stacked drums); its top surface sits at y = 0 so the
    // character (placed at the origin) stands on it.
    const stoneTop = new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.9 });
    const stoneBase = new THREE.MeshStandardMaterial({ color: 0x6e685d, roughness: 0.95 });
    const baseDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.78, 0.22, 36), stoneBase);
    baseDrum.position.y = gY + 0.11;
    this.envGroup.add(baseDrum);
    const topDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.46, 0.26, 36), stoneTop);
    topDrum.position.y = gY + 0.22 + 0.13;
    this.envGroup.add(topDrum);

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
