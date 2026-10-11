import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get<string>('databaseUrl'),
        // Dev-only: some networks (corporate proxy/AV) intercept TLS with a
        // self-signed cert, which breaks strict chain verification against
        // Supabase's certificate. Safe here because the connection is still
        // encrypted — only certificate authority verification is relaxed.
        ssl: config.get<string>('nodeEnv') === 'production' ? true : { rejectUnauthorized: false },
      }),
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
