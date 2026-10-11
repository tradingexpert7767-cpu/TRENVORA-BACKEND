import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TradeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTradeDto } from './dto/create-trade.dto.js';
import { CloseTradeDto } from './dto/close-trade.dto.js';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async createTrade(userId: string, dto: CreateTradeDto) {
    return this.prisma.paperTrade.create({
      data: {
        userId,
        instrument: dto.instrument,
        instrumentType: dto.instrumentType,
        side: dto.side,
        quantity: dto.quantity,
        entryPrice: dto.entryPrice,
        stopLoss: dto.stopLoss,
        target: dto.target,
        thesis: dto.thesis,
        emotion: dto.emotion,
        optionType: dto.optionType,
        strike: dto.strike,
        expiry: dto.expiry,
      },
    });
  }

  async closeTrade(userId: string, tradeId: string, dto: CloseTradeDto) {
    const trade = await this.prisma.paperTrade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.userId !== userId) throw new ForbiddenException();
    if (trade.status === TradeStatus.CLOSED) throw new NotFoundException('Trade already closed');

    const entryPrice = Number(trade.entryPrice);
    const exitPrice = dto.exitPrice;
    const multiplier = trade.side === 'BUY' ? 1 : -1;
    const pnl = (exitPrice - entryPrice) * trade.quantity * multiplier;

    return this.prisma.paperTrade.update({
      where: { id: tradeId },
      data: {
        exitPrice,
        pnl,
        status: TradeStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }

  async getTrades(userId: string, status?: 'OPEN' | 'CLOSED', limit = 50) {
    return this.prisma.paperTrade.findMany({
      where: { userId, ...(status ? { status: status as TradeStatus } : {}) },
      orderBy: { openedAt: 'desc' },
      take: Math.min(limit, 200),
    });
  }

  async deleteTrade(userId: string, tradeId: string) {
    const trade = await this.prisma.paperTrade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.userId !== userId) throw new ForbiddenException();
    await this.prisma.paperTrade.delete({ where: { id: tradeId } });
    return { deleted: true };
  }

  async resetTrades(userId: string) {
    const { count } = await this.prisma.paperTrade.deleteMany({ where: { userId } });
    return { deleted: count };
  }
}
