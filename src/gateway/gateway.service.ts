import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(private readonly httpService: HttpService) {}

  proxyRequest<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    this.logger.debug(`Proxying request to: ${config.url}`);
    return this.httpService.request<T>(config);
  }
} 