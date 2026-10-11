import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { TradesController } from './trades.controller.js';
import { TradesService } from './trades.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}
