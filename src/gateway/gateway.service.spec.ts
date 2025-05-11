import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { GatewayService } from './gateway.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('GatewayService', () => {
  let service: GatewayService;
  let httpService: HttpService;

  const mockHttpService = {
    request: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<GatewayService>(GatewayService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('proxyRequest', () => {
    it('should successfully proxy a request', (done) => {
      const mockResponse: AxiosResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const requestConfig = {
        method: 'GET',
        url: 'http://test.com/api',
        headers: { 'Content-Type': 'application/json' },
      };

      mockHttpService.request.mockReturnValue(of(mockResponse));

      service.proxyRequest(requestConfig).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(httpService.request).toHaveBeenCalledWith(requestConfig);
          done();
        },
        error: done.fail,
      });
    });

    it('should handle request errors', (done) => {
      const error = new Error('Network error');
      const requestConfig = {
        method: 'GET',
        url: 'http://test.com/api',
      };

      mockHttpService.request.mockReturnValue(throwError(() => error));

      service.proxyRequest(requestConfig).subscribe({
        next: () => done.fail('Should have thrown an error'),
        error: (err) => {
          expect(err).toBe(error);
          expect(httpService.request).toHaveBeenCalledWith(requestConfig);
          done();
        },
      });
    });
  });
}); 