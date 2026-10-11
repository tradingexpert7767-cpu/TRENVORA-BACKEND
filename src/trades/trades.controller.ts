import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TradesService } from './trades.service.js';
import { CreateTradeDto } from './dto/create-trade.dto.js';
import { CloseTradeDto } from './dto/close-trade.dto.js';

@Controller('trades')
@UseGuards(JwtAuthGuard)
export class TradesController {
  constructor(private readonly trades: TradesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: Request & { user?: { sub: string } }, @Body() dto: CreateTradeDto) {
    return this.trades.createTrade(req.user!.sub, dto);
  }

  @Patch(':id/close')
  @HttpCode(HttpStatus.OK)
  close(
    @Req() req: Request & { user?: { sub: string } },
    @Param('id') id: string,
    @Body() dto: CloseTradeDto,
  ) {
    return this.trades.closeTrade(req.user!.sub, id, dto);
  }

  @Get()
  list(
    @Req() req: Request & { user?: { sub: string } },
    @Query('status') status?: 'OPEN' | 'CLOSED',
    @Query('limit') limit?: string,
  ) {
    return this.trades.getTrades(req.user!.sub, status, limit ? parseInt(limit, 10) : 50);
  }

  @Delete('reset')
  @HttpCode(HttpStatus.OK)
  reset(@Req() req: Request & { user?: { sub: string } }) {
    return this.trades.resetTrades(req.user!.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: Request & { user?: { sub: string } }, @Param('id') id: string) {
    return this.trades.deleteTrade(req.user!.sub, id);
  }
}
