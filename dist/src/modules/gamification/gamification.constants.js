"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FREEZE_COUNT = exports.LEVEL_THRESHOLDS = exports.XP_REWARDS = void 0;
exports.calculateLevel = calculateLevel;
exports.XP_REWARDS = {
    REGISTER_EVENT: 50,
    ATTEND_EVENT: 100,
    SUBMIT_FEEDBACK: 25,
    DAILY_LOGIN: 10,
    STREAK_7_DAYS: 50,
    STREAK_30_DAYS: 200,
    BADGE_EARNED_BASE: 25,
};
exports.LEVEL_THRESHOLDS = [
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
];
function calculateLevel(totalXp) {
    let current = exports.LEVEL_THRESHOLDS[0];
    for (const threshold of exports.LEVEL_THRESHOLDS) {
        if (totalXp >= threshold.xp)
            current = threshold;
        else
            break;
    }
    const currentIndex = exports.LEVEL_THRESHOLDS.findIndex(t => t.level === current.level);
    const next = exports.LEVEL_THRESHOLDS[currentIndex + 1] ?? null;
    return { level: current.level, name: current.name, nextLevelXp: next?.xp ?? null };
}
exports.DEFAULT_FREEZE_COUNT = 3;
//# sourceMappingURL=gamification.constants.js.map