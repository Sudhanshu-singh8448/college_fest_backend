import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FestModule } from '../fest/fest.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    forwardRef(() => FestModule),
    forwardRef(() => GroupsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
