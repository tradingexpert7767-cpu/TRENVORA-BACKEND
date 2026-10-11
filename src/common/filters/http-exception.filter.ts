import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = isHttp ? exception.getResponse() : null;
    const message = isHttp
      ? typeof body === 'string'
        ? body
        : ((body as Record<string, unknown>)?.message ?? exception.message)
      : 'Something went wrong. Please try again.';

    if (!isHttp) {
      if (exception instanceof Error && 'code' in exception) {
        const prismaErr = exception as Error & { code?: string; meta?: unknown };
        this.logger.error(`${exception.constructor.name} code=${prismaErr.code} meta=${JSON.stringify(prismaErr.meta)} ${exception.message}`);
      } else {
        this.logger.error(exception instanceof Error ? exception.stack : exception);
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
