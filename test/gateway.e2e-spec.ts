import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('GatewayController (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  const mockHttpService = {
    request: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .compile();

    app = moduleFixture.createNestApplication();
    httpService = moduleFixture.get<HttpService>(HttpService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /gateway/*', () => {
    it('should proxy GET request successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {} as any,
      };

      mockHttpService.request.mockReturnValue(of(mockResponse));

      const response = await request(app.getHttpServer())
        .get('/gateway/test')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual({ message: 'success' });
      expect(mockHttpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/test'),
        }),
      );
    });

    it('should handle downstream service errors', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      mockHttpService.request.mockImplementation(() => {
        throw mockError;
      });

      const response = await request(app.getHttpServer())
        .get('/gateway/test')
        .set('Authorization', 'Bearer test-token')
        .expect(500);

      expect(response.body).toEqual({
        message: 'Gateway error',
        error: expect.any(String),
        data: { message: 'Internal Server Error' },
      });
    });

    it('should respect rate limiting', async () => {
      const mockResponse: AxiosResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {} as any,
      };

      mockHttpService.request.mockReturnValue(of(mockResponse));

      // Make multiple requests in quick succession
      const requests = Array(11).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/gateway/test')
          .set('Authorization', 'Bearer test-token'),
      );

      const responses = await Promise.all(requests);
      
      // The last request should be rate limited
      expect(responses[responses.length - 1].status).toBe(429);
    });
  });

  describe('POST /gateway/*', () => {
    it('should proxy POST request with body', async () => {
      const testBody = { data: 'test' };
      const mockResponse: AxiosResponse = {
        data: { message: 'created' },
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
        config: {} as any,
      };

      mockHttpService.request.mockReturnValue(of(mockResponse));

      const response = await request(app.getHttpServer())
        .post('/gateway/test')
        .set('Authorization', 'Bearer test-token')
        .send(testBody)
        .expect(201);

      expect(response.body).toEqual({ message: 'created' });
      expect(mockHttpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: expect.stringContaining('/test'),
          data: testBody,
        }),
      );
    });
  });
}); 