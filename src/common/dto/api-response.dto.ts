import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  meta?: any;

  @ApiProperty()
  error?: any;
}
