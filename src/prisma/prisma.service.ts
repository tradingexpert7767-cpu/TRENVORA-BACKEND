import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({ connectionString: config.get<string>('databaseUrl') }),
    });
  }

  async onModuleInit() {
    // Intentionally lazy: Prisma connects on first query. Eagerly connecting
    // here would block app startup whenever Postgres isn't reachable yet.
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
