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
  private dust: THREE.Points | null = null;
  private dustBaseY: Float32Array | null = null;
  private embers: THREE.Points | null = null;
  private emberPhase: Float32Array | null = null;
  private emberBaseColor: Float32Array | null = null;
  private classFx: THREE.Group | null = null;
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
    // Lighter fog so the village (houses, campfire, treeline) reads more clearly.
    this.scene.fog = new THREE.Fog(0x33384f, 15, 40);

    // 3. Initialize Camera — framed so the hero is large and prominent on the
    //    carved pedestal with the village clearing around them.
    const aspect = this.container.clientHeight > 0
      ? this.container.clientWidth / this.container.clientHeight
      : 1;
    this.camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 200);
    this.camera.position.set(0.45, 1.8, 5.8);
    this.camera.lookAt(new THREE.Vector3(0, 1.2, 0));

    // 4. Initialize Character Group
    this.characterGroup = new THREE.Group();
    this.scene.add(this.characterGroup);

    // 5. Dusk lighting: dim cool ambient, a low warm sunset key, a dedicated
    //    front fill that keeps the hero crisp and bright, and a cool back rim.
    const hemiLight = new THREE.HemisphereLight(0x5b6aa0, 0x3a2e22, 0.62);
    this.scene.add(hemiLight);
    const sun = new THREE.DirectionalLight(0xffb066, 1.3);
    sun.position.set(6, 3.5, 4);
    this.scene.add(sun);
    const heroKey = new THREE.DirectionalLight(0xfff0d8, 1.95);
    heroKey.position.set(1.5, 4, 6);
    this.scene.add(heroKey);
    const rim = new THREE.DirectionalLight(0x6a7cb0, 0.5);
    rim.position.set(-4, 4, -4);
    this.scene.add(rim);

    // 5a. Hero-local lights (short range so they lift the character without
    //     washing out the village): a warm front fill, a cool rim behind, and a
    //     warm up-glow rising from the pedestal.
    const warmFront = new THREE.PointLight(0xffe1bc, 3.9, 7.5, 2);
    warmFront.position.set(0.3, 1.95, 2.7);
    this.scene.add(warmFront);
    // A soft chest-level fill to bring out the armour without flattening it.
    const chestFill = new THREE.PointLight(0xfff0dc, 1.5, 5, 2);
    chestFill.position.set(0.1, 1.2, 2.4);
    this.scene.add(chestFill);
    const heroRim = new THREE.PointLight(0xcfe0ff, 2.3, 6, 2);
    heroRim.position.set(-0.5, 2.6, -2.0);
    this.scene.add(heroRim);
    const pedGlow = new THREE.PointLight(0xffb866, 1.3, 4.2, 2);
    pedGlow.position.set(0, this.groundY + 0.55, 0);
    this.scene.add(pedGlow);

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
        emissive: 0xffb45a, emissiveMap: this.makeRuneTexture(), emissiveIntensity: 1.2,
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
    // A small cluster directly behind the hero so the centre reads as a village
    // (kept far back + fogged so it stays a soft, dark backdrop).
    mkHouse(-2.6, -8.5, 1.0);
    mkHouse(2.8, -9.2, 1.15);
    mkHouse(0.2, -11, 1.3);

    // Warm campfire light (bonfire prop loads in below).
    this.campfireLight = new THREE.PointLight(0xff8a36, 3.0, 12, 2);
    this.campfireLight.position.set(-2.1, gY + 0.5, 1.7);
    this.envGroup.add(this.campfireLight);

    // Cozy lantern glows by the inn and the blacksmith forge.
    const innLantern = new THREE.PointLight(0xffcf87, 1.4, 9, 2);
    innLantern.position.set(4.6, gY + 1.6, -2.2);
    this.envGroup.add(innLantern);
    const forgeGlow = new THREE.PointLight(0xff9a4a, 1.3, 8, 2);
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

    // Atmosphere / depth pass: contact shadow, ground mist, dust motes, shafts.
    this.addAtmosphere();
  }

  /**
   * Depth & atmosphere: a soft contact shadow grounding the hero on the
   * pedestal, low ground mist around the base, drifting dust motes, and a
   * couple of gentle warm light shafts from the sunset side.
   */
  private addAtmosphere(): void {
    const gY = this.groundY;

    // Soft contact shadow connecting the character to the pedestal top.
    const shadowTex = this.makeRadialTexture(['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.32)', 'rgba(0,0,0,0)']);
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.5),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.85 }),
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.set(0, 0.02, 0.05);
    this.envGroup.add(contact);

    // Low ground mist around the pedestal base (two soft, near-flat discs).
    const mistTex = this.makeRadialTexture(['rgba(150,170,205,0.0)', 'rgba(140,162,200,0.16)', 'rgba(120,140,180,0)']);
    const mistMat = new THREE.MeshBasicMaterial({ map: mistTex, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending });
    for (let i = 0; i < 2; i++) {
      const mist = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 8.5), mistMat);
      mist.rotation.x = -Math.PI / 2;
      mist.position.set(0, gY + 0.12 + i * 0.12, 0.4);
      this.envGroup.add(mist);
    }

    // Drifting dust motes caught in the light.
    const COUNT = 130;
    const pos = new Float32Array(COUNT * 3);
    this.dustBaseY = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 7.5;
      const y = gY + 0.3 + Math.random() * 4.2;
      const z = (Math.random() - 0.5) * 6 + 0.5;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      this.dustBaseY[i] = y;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dustMat = new THREE.PointsMaterial({
      map: this.makeRadialTexture(['rgba(255,244,222,0.9)', 'rgba(255,240,210,0.4)', 'rgba(255,240,210,0)']),
      color: 0xffe9c4, size: 0.06, sizeAttenuation: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7,
    });
    this.dust = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dust);

    // Gentle warm light shafts angled in from the sunset side.
    const shaftTex = this.makeShaftTexture();
    const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, opacity: 0.16, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) {
      const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1.4 + i * 0.5, 9), shaftMat);
      shaft.position.set(2.6 + i * 1.4, gY + 4.2, -2.5 - i * 0.6);
      shaft.rotation.z = 0.32 + i * 0.05;
      shaft.rotation.y = -0.5;
      this.scene.add(shaft);
    }

    // Light embers + fireflies: warm sparks clustered over the campfire and a
    // few cool fireflies drifting through the clearing. Each flickers on its own.
    const E = 56;
    const epos = new Float32Array(E * 3);
    const ecol = new Float32Array(E * 3);
    this.emberPhase = new Float32Array(E);
    this.emberBaseColor = new Float32Array(E * 3);
    for (let i = 0; i < E; i++) {
      const ember = i < E * 0.6;
      if (ember) {
        // Rising sparks above the campfire at (-2.1, _, 1.7).
        epos[i * 3] = -2.1 + (Math.random() - 0.5) * 1.3;
        epos[i * 3 + 1] = gY + 0.2 + Math.random() * 1.8;
        epos[i * 3 + 2] = 1.7 + (Math.random() - 0.5) * 1.3;
        ecol[i * 3] = 1.0; ecol[i * 3 + 1] = 0.55; ecol[i * 3 + 2] = 0.18;
      } else {
        // Fireflies wandering the clearing.
        epos[i * 3] = (Math.random() - 0.5) * 8;
        epos[i * 3 + 1] = gY + 0.5 + Math.random() * 2.4;
        epos[i * 3 + 2] = (Math.random() - 0.5) * 5 + 0.5;
        ecol[i * 3] = 0.75; ecol[i * 3 + 1] = 0.95; ecol[i * 3 + 2] = 0.5;
      }
      this.emberPhase[i] = Math.random() * Math.PI * 2;
      this.emberBaseColor[i * 3] = ecol[i * 3];
      this.emberBaseColor[i * 3 + 1] = ecol[i * 3 + 1];
      this.emberBaseColor[i * 3 + 2] = ecol[i * 3 + 2];
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(epos, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(ecol, 3));
    const emberMat = new THREE.PointsMaterial({
      map: this.makeRadialTexture(['rgba(255,255,255,0.95)', 'rgba(255,230,180,0.4)', 'rgba(255,210,150,0)']),
      size: 0.09, sizeAttenuation: true, vertexColors: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9,
    });
    this.embers = new THREE.Points(emberGeo, emberMat);
    this.scene.add(this.embers);
  }

  /** Radial gradient sprite/decal texture from a list of colour stops. */
  private makeRadialTexture(stops: string[]): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Vertical warm gradient used for the soft light shafts. */
  private makeShaftTexture(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0, 'rgba(255,225,170,0.55)');
    g.addColorStop(0.5, 'rgba(255,220,160,0.18)');
    g.addColorStop(1.0, 'rgba(255,215,150,0)');
    const h = ctx.createLinearGradient(0, 0, 64, 0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 256);
    // taper the sides
    ctx.globalCompositeOperation = 'destination-in';
    h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = h; ctx.fillRect(0, 0, 64, 256);
    ctx.globalCompositeOperation = 'source-over';
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Swap the per-class signature effect (only the Mage has one for now). */
  private setClassFx(cls: PlayerClass): void {
    if (this.classFx) {
      this.scene.remove(this.classFx);
      this.classFx.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as unknown as { material?: THREE.Material | THREE.Material[] }).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      this.classFx = null;
    }
    if (cls === 'mage') {
      this.classFx = this.buildMageFx();
      this.scene.add(this.classFx);
    }
  }

  /** Arcane motes orbiting the caster + a very light magical aura. Centred on
   *  the origin so it stays put while the hero turntable rotates. */
  private buildMageFx(): THREE.Group {
    const g = new THREE.Group();
    // Floating arcane motes (cool blue/violet), orbiting the caster. +25% count.
    const N = 58;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.35 + Math.random() * 0.7;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = this.groundY + 0.4 + Math.random() * 2.2;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const motes = new THREE.Points(geo, new THREE.PointsMaterial({
      map: this.makeRadialTexture(['rgba(205,212,255,0.95)', 'rgba(135,125,240,0.4)', 'rgba(120,110,235,0)']),
      color: 0xaab6ff, size: 0.085, sizeAttenuation: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85,
    }));
    motes.name = 'mageMotes';
    g.add(motes);

    // Small floating runes slowly circling the caster.
    const runeTex = this.makeMageRuneTexture();
    const runes = new THREE.Group();
    runes.name = 'mageRunes';
    const RUNES = 6;
    for (let i = 0; i < RUNES; i++) {
      const ang = (i / RUNES) * Math.PI * 2;
      const rr = 0.95 + (i % 2) * 0.25;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: runeTex, color: 0xbcc6ff, transparent: true,
        depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.72,
      }));
      sprite.position.set(Math.cos(ang) * rr, this.groundY + 0.9 + (i % 3) * 0.6, Math.sin(ang) * rr);
      sprite.scale.setScalar(0.34);
      runes.add(sprite);
    }
    g.add(runes);

    // Very light magical aura halo behind the caster.
    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.7),
      new THREE.MeshBasicMaterial({
        map: this.makeRadialTexture(['rgba(120,130,255,0)', 'rgba(95,85,215,0.22)', 'rgba(70,60,180,0)']),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5,
      }),
    );
    aura.position.set(0, this.groundY + 1.5, -0.4);
    aura.name = 'mageAura';
    g.add(aura);

    // Subtle blue-purple light washing the face and robe from the front.
    const arcaneLight = new THREE.PointLight(0x8a7cff, 2.0, 6, 2);
    arcaneLight.position.set(0.2, this.groundY + 2.0, 2.0);
    g.add(arcaneLight);
    return g;
  }

  /** A single angular arcane rune glyph (white on transparent) for the FX sprites. */
  private makeMageRuneTexture(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d')!;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(32, 10); ctx.lineTo(32, 54);
    ctx.moveTo(32, 20); ctx.lineTo(46, 12);
    ctx.moveTo(32, 40); ctx.lineTo(18, 50);
    ctx.moveTo(20, 30); ctx.lineTo(44, 30);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
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

      // Per-class signature effects (Mage = arcane motes + aura + staff glow).
      this.setClassFx(cls);

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
      this.campfireLight.intensity = 3.0 + Math.sin(t * 11) * 0.4 + Math.sin(t * 19) * 0.2;
    }

    // Drifting dust motes: slow upward rise with a gentle sideways sway; wrap
    // back to the base height so the cloud loops seamlessly.
    if (this.dust && this.dustBaseY) {
      const t = this.clock.elapsedTime;
      const arr = (this.dust.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < this.dustBaseY.length; i++) {
        const span = 4.2;
        let y = arr[i * 3 + 1] + dt * 0.12;
        if (y > this.dustBaseY[i] + span) y -= span;
        arr[i * 3 + 1] = y;
        arr[i * 3] += Math.sin(t * 0.5 + i) * dt * 0.04;
      }
      (this.dust.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    }

    // Embers / fireflies: rise and drift, flickering individually.
    if (this.embers && this.emberPhase && this.emberBaseColor) {
      const t = this.clock.elapsedTime;
      const pAttr = this.embers.geometry.getAttribute('position') as THREE.BufferAttribute;
      const cAttr = this.embers.geometry.getAttribute('color') as THREE.BufferAttribute;
      const p = pAttr.array as Float32Array;
      const c = cAttr.array as Float32Array;
      for (let i = 0; i < this.emberPhase.length; i++) {
        let y = p[i * 3 + 1] + dt * 0.28;
        if (y > this.groundY + 3.0) y = this.groundY + 0.2;
        p[i * 3 + 1] = y;
        p[i * 3] += Math.sin(t * 0.8 + this.emberPhase[i]) * dt * 0.08;
        const flick = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3.5 + this.emberPhase[i] * 4));
        c[i * 3] = this.emberBaseColor[i * 3] * flick;
        c[i * 3 + 1] = this.emberBaseColor[i * 3 + 1] * flick;
        c[i * 3 + 2] = this.emberBaseColor[i * 3 + 2] * flick;
      }
      pAttr.needsUpdate = true;
      cAttr.needsUpdate = true;
    }

    // Mage arcane FX: slowly orbit the motes and gently pulse the aura.
    if (this.classFx) {
      const t = this.clock.elapsedTime;
      const motes = this.classFx.getObjectByName('mageMotes');
      if (motes) motes.rotation.y += dt * 0.55;
      const runes = this.classFx.getObjectByName('mageRunes');
      if (runes) {
        runes.rotation.y -= dt * 0.3;
        runes.position.y = Math.sin(t * 0.9) * 0.08;
      }
      const aura = this.classFx.getObjectByName('mageAura') as THREE.Mesh | null;
      if (aura) {
        const m = aura.material as THREE.MeshBasicMaterial;
        m.opacity = 0.42 + Math.sin(t * 1.6) * 0.12;
      }
    }

    // Auto-rotation: half-speed turntable that eases to a brief dwell whenever
    // the hero faces forward, so the face stays visible more of the time.
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReducedMotion && !this.isDragging) {
      const TAU = Math.PI * 2;
      let a = this.characterGroup.rotation.y % TAU;
      if (a < 0) a += TAU;
      const distFront = Math.min(a, TAU - a);              // 0 when facing forward
      const ease = Math.min(distFront / 0.7, 1);           // slow within ~0.7 rad of front
      const factor = 0.06 + 0.94 * ease;                   // near-pause at the front
      this.characterGroup.rotation.y += 0.175 * factor * dt; // 50% of the old speed
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
