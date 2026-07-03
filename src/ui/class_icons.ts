// Class portrait PNGs — same assets as character selection (`/assets/icons/classes/*.png`).
import type { PlayerClass } from '../sim/types';
import { ALL_CLASSES } from '../sim/types';
import { iconCanvas } from './icons';

export function classIconUrl(cls: string): string {
  return `/assets/icons/classes/${cls}.png`;
}

const imgCache = new Map<string, HTMLImageElement>();
const imgLoading = new Map<string, Promise<HTMLImageElement>>();

function loadClassIcon(cls: string): Promise<HTMLImageElement> {
  const hit = imgCache.get(cls);
  if (hit?.complete && hit.naturalWidth > 0) return Promise.resolve(hit);
  let p = imgLoading.get(cls);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        imgCache.set(cls, img);
        imgLoading.delete(cls);
        resolve(img);
      };
      img.onerror = () => {
        imgLoading.delete(cls);
        reject(new Error(`class icon missing: ${cls}`));
      };
      img.src = classIconUrl(cls);
    });
    imgLoading.set(cls, p);
  }
  return p;
}

function blitCircular(canvas: HTMLCanvasElement, img: CanvasImageSource): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const s = canvas.width;
  ctx.clearRect(0, 0, s, s);
  ctx.save();
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, 0, 0, s, s);
  ctx.restore();
}

/** Unit-frame portrait using the character-select class PNG. */
export function drawClassPortrait(canvas: HTMLCanvasElement, cls: string): void {
  void loadClassIcon(cls).then((img) => blitCircular(canvas, img)).catch(() => {
    drawCrestPortrait(canvas, `class_${cls}`);
  });
}

/** NPC / mob procedural crest portraits. */
export function drawCrestPortrait(canvas: HTMLCanvasElement, crestId: string): void {
  const s = canvas.width;
  const render = Math.max(s, 108);
  blitCircular(canvas, iconCanvas('crest', crestId, render));
}

export function preloadClassIcons(classes: readonly PlayerClass[] = ALL_CLASSES): void {
  for (const cls of classes) void loadClassIcon(cls);
}
