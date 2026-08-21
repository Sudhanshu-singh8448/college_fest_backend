import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';

@Module({
  providers: [AuditService],
  exports: [AuditService], // Exported for use by any module that needs audit logging
})
export class AuditModule {}
