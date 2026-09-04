import { GamificationService } from './gamification.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getMyProfile(user: any): Promise<{
        user: {
            id: string;
            registrationNumber: string;
            profile: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            } | null;
        } | null;
        xp: {
            total: number;
            level: number;
            levelName: string;
            nextLevelXp: number | null;
            rank: number | null;
        };
        badges: {
            id: string;
            earnedAt: Date;
            badge: {
                id: string;
                name: string;
                description: string;
                createdAt: Date;
                iconUrl: string;
                condition: string;
                xpReward: number;
            };
        }[];
        streak: {
            current: number;
            longest: number;
            freezesRemaining: number;
            lastCheckIn: Date | null;
        };
    }>;
    getLeaderboard(query: LeaderboardQueryDto): Promise<{
        entries: {
            rank: number;
            totalXp: number;
            level: number;
            levelName: string;
            user: {
                id: string;
                registrationNumber: string;
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        refreshedAt: Date;
    }>;
    getMyRank(user: any): Promise<{
        rank: null;
        totalXp: number;
        level: number;
        message: string;
        levelName?: undefined;
        xpToNextRank?: undefined;
        nearbyRanks?: undefined;
    } | {
        rank: number;
        totalXp: number;
        level: number;
        levelName: string;
        xpToNextRank: number | null;
        nearbyRanks: {
            above: {
                level: number;
                id: string;
                updatedAt: Date;
                userId: string;
                totalXp: number;
                rank: number;
            } | null;
            below: {
                level: number;
                id: string;
                updatedAt: Date;
                userId: string;
                totalXp: number;
                rank: number;
            } | null;
        };
        message?: undefined;
    }>;
    getAllBadges(): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        iconUrl: string;
        condition: string;
        xpReward: number;
    }[]>;
    getMyBadges(user: any): Promise<{
        earned: {
            earnedAt: Date;
            id: string;
            name: string;
            description: string;
            createdAt: Date;
            iconUrl: string;
            condition: string;
            xpReward: number;
        }[];
        total: number;
        totalAvailable: number;
        completionPercent: number;
    }>;
    checkIn(user: any): Promise<{
        alreadyCheckedIn: boolean;
        currentStreak: number;
        longestStreak: number;
        message: string;
        xpAwarded?: undefined;
        totalXp?: undefined;
        level?: undefined;
        bonusMessages?: undefined;
    } | {
        alreadyCheckedIn: boolean;
        currentStreak: number;
        longestStreak: number;
        xpAwarded: number;
        totalXp: number;
        level: number;
        bonusMessages: string[];
        message: string;
    }>;
    useStreakFreeze(user: any): Promise<{
        freezesRemaining: number;
        currentStreak: number;
        message: string;
    }>;
}
