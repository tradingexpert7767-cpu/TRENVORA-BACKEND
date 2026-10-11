import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    const isProd = config.get<string>('nodeEnv') === 'production';
    const pool = new Pool({
      connectionString: config.get<string>('databaseUrl'),
      // Dev: relax cert chain verification for corporate proxy/AV TLS interception.
      ssl: isProd ? true : { rejectUnauthorized: false },
    });
    super({
      adapter: new PrismaPg(pool),
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
