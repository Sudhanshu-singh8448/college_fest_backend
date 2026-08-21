import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { VerifyQrDto } from './dto/verify-qr.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    verifyQr(dto: VerifyQrDto): Promise<{
        isValid: boolean;
        user: {
            id: string;
            email: string | null;
            registrationNumber: string;
            firstName: string | undefined;
            lastName: string | undefined;
        };
        ticket: {
            id: string;
            ticketNumber: string;
            festId: string;
        };
    }>;
    checkIn(dto: CheckInDto, user: any): Promise<{
        status: string;
        userName: string;
        eventName: string;
        scannedAt: Date;
    }>;
    getEventAttendance(eventId: string, user: any): Promise<({
        user: {
            profile: {
                userId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                bio: string | null;
                phone: string | null;
                collegeId: string | null;
                branchId: string | null;
                batchId: string | null;
            } | null;
            id: string;
            registrationNumber: string;
        };
    } & {
        userId: string;
        id: string;
        eventId: string;
        scannedBy: string | null;
        scannedAt: Date;
    })[]>;
}
