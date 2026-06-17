import type { SetDef } from '../types';

// Item sets. A piece declares `setId: '<id>'` (see content/items.ts); equipping
// enough members activates the matching bonus tiers (applied in recalcPlayerStats).
// Bonuses are flat stats and follow the same "no power past the gear" itemization
// budget as individual pieces. Tiers must be ascending by `pieces`.
export const SETS: Record<string, SetDef> = {
  recruit_vigil: {
    id: 'recruit_vigil',
    name: "Recruit's Vigil",
    bonuses: [
      { pieces: 2, stats: { sta: 3 } },
      { pieces: 3, stats: { armor: 8, str: 2 } },
    ],
  },
};
