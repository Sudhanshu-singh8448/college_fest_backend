import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class EventQueryDto extends PaginationDto {
    category?: string;
    status?: string;
    search?: string;
    festId?: string;
}
