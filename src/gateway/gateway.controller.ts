import {
  Controller,
  All,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Query,
  Body,
  Headers,
  Param,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@ApiTags('gateway')
@Controller('gateway')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('*')
  @Throttle(10, 60) // 10 requests per 60 seconds per user
  @ApiOperation({ summary: 'Proxy all requests to downstream services' })
  @ApiResponse({ status: 200, description: 'Proxied response' })
  async proxyAll(@Req() req: Request, @Res() res: Response) {
    // Example: Forward all requests to a downstream service (e.g., http://localhost:4000)
    const downstreamUrl = process.env.DOWNSTREAM_URL || 'http://localhost:4000';
    const url = downstreamUrl + req.originalUrl.replace(/^\/gateway/, '');

    const config = {
      method: req.method as any,
      url,
      headers: { ...req.headers, host: undefined },
      data: req.body,
      params: req.query,
      responseType: 'stream',
    };

    this.gatewayService.proxyRequest(config)
      .pipe(
        map((response) => {
          res.status(response.status).set(response.headers);
          response.data.pipe(res);
        }),
        catchError((error) => {
          res.status(error.response?.status || HttpStatus.BAD_GATEWAY).json({
            message: 'Gateway error',
            error: error.message,
            data: error.response?.data,
          });
          return [] as any;
        }),
      )
      .subscribe();
  }
} 