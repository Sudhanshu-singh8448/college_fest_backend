// XP rewards per action
export const XP_REWARDS = {
  REGISTER_EVENT: 50,
  ATTEND_EVENT: 100,
  SUBMIT_FEEDBACK: 25,
  DAILY_LOGIN: 10,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
  BADGE_EARNED_BASE: 25,
} as const;

// Level thresholds (cumulative XP needed to reach each level)
export const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Noob', xp: 0 },
  { level: 2, name: 'Tinkerer', xp: 100 },
  { level: 3, name: 'Maker', xp: 300 },
  { level: 4, name: 'Builder', xp: 600 },
  { level: 5, name: 'Engineer', xp: 1000 },
  { level: 6, name: 'Architect', xp: 1500 },
  { level: 7, name: 'Innovator', xp: 2200 },
  { level: 8, name: 'Visionary', xp: 3000 },
  { level: 9, name: 'Pioneer', xp: 4000 },
  { level: 10, name: 'Hacker', xp: 5500 },
  { level: 15, name: 'Technomancer', xp: 12000 },
  { level: 20, name: 'Cybernaught', xp: 22000 },
  { level: 30, name: 'Quantum Master', xp: 36000 },
  { level: 40, name: 'Digital God', xp: 50000 },
] as const;

/** Calculate level & level name from total XP */
export function calculateLevel(totalXp: number): { level: number; name: string; nextLevelXp: number | null } {
  let current: { level: number; name: string; xp: number } = LEVEL_THRESHOLDS[0];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXp >= threshold.xp) current = threshold;
    else break;
  }
  const currentIndex = LEVEL_THRESHOLDS.findIndex(t => t.level === current.level);
  const next = LEVEL_THRESHOLDS[currentIndex + 1] ?? null;
  return { level: current.level, name: current.name, nextLevelXp: next?.xp ?? null };
}

// Default streak freeze inventory for new users
export const DEFAULT_FREEZE_COUNT = 3;
