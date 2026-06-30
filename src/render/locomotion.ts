// Locomotion-state derivation for the character animation state machine,
// factored out of the renderer so it can be reasoned about and tested without
// a WebGL context. Render-space speed is sampled per frame and is noisy:
// frame-time jitter, snapshot interpolation stalls, and vertical bob over
// uneven terrain all make a steadily-walking entity momentarily read as
// stopped. Without leeway that single-frame dip flips the anim state to idle
// and resets the walk clip the next frame — visible leg jitter. So we enter
// the moving state above a low speed, latch it for a grace window after speed
// dips, smooth the cadence-driving speed, and hold the travel direction.

export const MOVE_ENTER_SPEED = 0.4; // u/s above which an entity is "moving"
export const MOVE_HOLD_TIME = 0.22; // s to keep "moving" latched after speed dips
export const SPEED_SMOOTH_RATE = 12; // EMA rate for the cadence-driving speed
const TELEPORT_SPEED = 25; // u/s above this is a snap, not locomotion
const STRAFE_DOMINANCE = 0.35;
const STRAFE_EXIT_FORWARD = 0.55; // stay in strafe until forward dominates
const BACKPEDAL_DOT = -0.3;

function dirFromVelocity(
  fwd: number, right: number, prev: LocoMoveDir,
): LocoMoveDir {
  if (fwd < BACKPEDAL_DOT) return 'back';
  const absR = Math.abs(right);
  const absF = Math.abs(fwd);
  if (prev === 'strafeLeft' || prev === 'strafeRight') {
    if (absR > 0.25 && absR >= absF) return right > 0 ? 'strafeRight' : 'strafeLeft';
    if (absF > STRAFE_EXIT_FORWARD) return 'forward';
    return prev;
  }
  if (absR > STRAFE_DOMINANCE && absR >= absF) return right > 0 ? 'strafeRight' : 'strafeLeft';
  return 'forward';
}

function dirFromInput(hint: LocoInputHint): LocoMoveDir | null {
  const { forward, back, strafeLeft, strafeRight } = hint;
  const lat = strafeLeft || strafeRight;
  if (!forward && !back && strafeLeft && !strafeRight) return 'strafeLeft';
  if (!forward && !back && strafeRight && !strafeLeft) return 'strafeRight';
  if (back && !forward && !lat) return 'back';
  if (forward && !back && !lat) return 'forward';
  if (lat && !forward && !back) return strafeRight ? 'strafeRight' : 'strafeLeft';
  // Diagonal (W+A, etc.): keep forward/back anim — velocity-based strafe flips
  // frame-to-frame and reads as camera/leg jitter.
  if (forward && !back) return 'forward';
  if (back && !forward) return 'back';
  return null;
}

export type LocoMoveDir = 'forward' | 'back' | 'strafeLeft' | 'strafeRight';

/** Optional held-key hint (local player) — stable vs noisy render velocity. */
export interface LocoInputHint {
  forward: boolean;
  back: boolean;
  strafeLeft: boolean;
  strafeRight: boolean;
}

/** Per-entity hysteresis state; the renderer keeps one of these per view. */
export interface LocoTrack {
  moveHold: number;
  smoothSpeed: number;
  movingDir: LocoMoveDir;
}

export interface LocoState {
  speed: number; // smoothed, for footstep cadence matching
  moving: boolean;
  backwards: boolean;
  strafeLeft: boolean;
  strafeRight: boolean;
}

export function newLocoTrack(): LocoTrack {
  return { moveHold: 0, smoothSpeed: 0, movingDir: 'forward' };
}

/**
 * Advance the locomotion hysteresis by one frame.
 * @param t      per-entity track (mutated in place)
 * @param vx,vz  render-space horizontal displacement since last frame
 * @param facing entity facing (radians, 0 = +Z) for backpedal detection
 * @param dt     frame delta in seconds
 */
export function updateLocomotion(
  t: LocoTrack, vx: number, vz: number, facing: number, dt: number,
  input?: LocoInputHint,
): LocoState {
  const dist = Math.hypot(vx, vz);
  let speed = dist / Math.max(dt, 1e-4);
  if (speed > TELEPORT_SPEED) speed = 0; // teleport snap, not locomotion

  if (speed > MOVE_ENTER_SPEED) t.moveHold = MOVE_HOLD_TIME;
  else t.moveHold = Math.max(0, t.moveHold - dt);
  const moving = t.moveHold > 0;

  // smooth cadence speed; while latched-but-stalled keep the last value so
  // footsteps don't lurch toward zero on a stalled frame
  if (speed > MOVE_ENTER_SPEED || !moving) {
    t.smoothSpeed += (speed - t.smoothSpeed) * Math.min(1, dt * SPEED_SMOOTH_RATE);
  }

  // only re-judge direction on frames with real displacement; a stalled frame
  // keeps the last direction so walkBack/strafe clips don't flip and reset
  if (speed > MOVE_ENTER_SPEED && dist > 1e-6) {
    const inputDir = input ? dirFromInput(input) : null;
    if (inputDir) {
      t.movingDir = inputDir;
    } else if (input) {
      // Diagonal / mixed keys: fall back to velocity vs facing for the player.
      const fwd = (vx * Math.sin(facing) + vz * Math.cos(facing)) / dist;
      const right = (vx * Math.cos(facing) - vz * Math.sin(facing)) / dist;
      t.movingDir = dirFromVelocity(fwd, right, t.movingDir);
    } else {
      // NPCs/mobs: always forward walk/run — render velocity vs facing is noisy
      // during snapshot interpolation and would flip walkBack / strafe clips.
      t.movingDir = 'forward';
    }
  } else if (!moving) {
    t.movingDir = 'forward';
  }

  const strafeL = moving && t.movingDir === 'strafeLeft';
  const strafeR = moving && t.movingDir === 'strafeRight';
  // Lateral lean / strafe visuals are player-only (A/D rebound).
  const strafeVisual = !!input && (strafeL || strafeR);

  return {
    speed: t.smoothSpeed,
    moving,
    backwards: !!input && moving && t.movingDir === 'back',
    strafeLeft: strafeVisual && strafeL,
    strafeRight: strafeVisual && strafeR,
  };
}
