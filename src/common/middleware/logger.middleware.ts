import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;

    this.logger.log(
      `${method} ${originalUrl} - Body: ${JSON.stringify(body, null, 2)}`,
    );

    next();
  }
}
