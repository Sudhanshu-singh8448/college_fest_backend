import { GamificationService } from './gamification.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getMyProfile(user: any): Promise<{
        user: {
            profile: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            } | null;
            id: string;
            registrationNumber: string;
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
                description: string;
                name: string;
                id: string;
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
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
                id: string;
                registrationNumber: string;
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
                userId: string;
                id: string;
                updatedAt: Date;
                totalXp: number;
                level: number;
                rank: number;
            } | null;
            below: {
                userId: string;
                id: string;
                updatedAt: Date;
                totalXp: number;
                level: number;
                rank: number;
            } | null;
        };
        message?: undefined;
    }>;
    getAllBadges(): Promise<{
        description: string;
        name: string;
        id: string;
        createdAt: Date;
        iconUrl: string;
        condition: string;
        xpReward: number;
    }[]>;
    getMyBadges(user: any): Promise<{
        earned: {
            earnedAt: Date;
            description: string;
            name: string;
            id: string;
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
