import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of various components',
  })
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),

      // Disk health check
      () =>
        this.disk.checkStorage('disk', {
          thresholdPercent: 0.9, // 90% disk usage threshold
          path: '/',
        }),

      // Memory health check
      () =>
        this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB threshold
      () =>
        this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB threshold
    ]);
  }
} 