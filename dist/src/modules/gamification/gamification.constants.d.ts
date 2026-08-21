export declare const XP_REWARDS: {
    readonly REGISTER_EVENT: 50;
    readonly ATTEND_EVENT: 100;
    readonly SUBMIT_FEEDBACK: 25;
    readonly DAILY_LOGIN: 10;
    readonly STREAK_7_DAYS: 50;
    readonly STREAK_30_DAYS: 200;
    readonly BADGE_EARNED_BASE: 25;
};
export declare const LEVEL_THRESHOLDS: readonly [{
    readonly level: 1;
    readonly name: "Noob";
    readonly xp: 0;
}, {
    readonly level: 2;
    readonly name: "Tinkerer";
    readonly xp: 100;
}, {
    readonly level: 3;
    readonly name: "Maker";
    readonly xp: 300;
}, {
    readonly level: 4;
    readonly name: "Builder";
    readonly xp: 600;
}, {
    readonly level: 5;
    readonly name: "Engineer";
    readonly xp: 1000;
}, {
    readonly level: 6;
    readonly name: "Architect";
    readonly xp: 1500;
}, {
    readonly level: 7;
    readonly name: "Innovator";
    readonly xp: 2200;
}, {
    readonly level: 8;
    readonly name: "Visionary";
    readonly xp: 3000;
}, {
    readonly level: 9;
    readonly name: "Pioneer";
    readonly xp: 4000;
}, {
    readonly level: 10;
    readonly name: "Hacker";
    readonly xp: 5500;
}, {
    readonly level: 15;
    readonly name: "Technomancer";
    readonly xp: 12000;
}, {
    readonly level: 20;
    readonly name: "Cybernaught";
    readonly xp: 22000;
}, {
    readonly level: 30;
    readonly name: "Quantum Master";
    readonly xp: 36000;
}, {
    readonly level: 40;
    readonly name: "Digital God";
    readonly xp: 50000;
}];
export declare function calculateLevel(totalXp: number): {
    level: number;
    name: string;
    nextLevelXp: number | null;
};
export declare const DEFAULT_FREEZE_COUNT = 3;
