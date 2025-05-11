# API Gateway Usage Guide

This guide provides examples and best practices for using the API Gateway in your microservices architecture.

## Basic Usage

The API Gateway acts as a reverse proxy, forwarding requests to downstream services while providing additional features like authentication, rate limiting, and request/response transformation.

### Environment Setup

1. Configure the downstream service URL in your `.env` file:
```env
DOWNSTREAM_URL=http://your-service:4000
```

### Making Requests

All requests to downstream services should be made through the gateway at the `/gateway` endpoint. The gateway will automatically forward the request to the appropriate service.

#### Example: GET Request

```bash
# Original request to service
curl http://your-service:4000/api/users

# Request through gateway
curl http://gateway:3000/gateway/api/users \
  -H "Authorization: Bearer your-jwt-token"
```

#### Example: POST Request with Body

```bash
# Original request to service
curl -X POST http://your-service:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Request through gateway
curl -X POST http://gateway:3000/gateway/api/users \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

## Features

### 1. Authentication

The gateway automatically validates JWT tokens for all requests. Include the token in the `Authorization` header:

```bash
curl http://gateway:3000/gateway/api/protected \
  -H "Authorization: Bearer your-jwt-token"
```

### 2. Rate Limiting

The gateway implements rate limiting (10 requests per 60 seconds per user). When the limit is exceeded, you'll receive a 429 status code:

```bash
# First 10 requests will succeed
for i in {1..10}; do
  curl http://gateway:3000/gateway/api/test \
    -H "Authorization: Bearer your-jwt-token"
done

# 11th request will be rate limited
curl http://gateway:3000/gateway/api/test \
  -H "Authorization: Bearer your-jwt-token"
# Response: 429 Too Many Requests
```

### 3. Request/Response Transformation

The gateway includes interceptors for logging and response transformation. All responses are automatically wrapped in a standard format:

```json
{
  "data": {
    // Your actual response data
  },
  "timestamp": "2024-03-14T12:00:00.000Z",
  "path": "/gateway/api/users"
}
```

### 4. Error Handling

The gateway provides consistent error responses:

```json
{
  "message": "Gateway error",
  "error": "Error message from downstream service",
  "data": {
    // Additional error details from downstream service
  }
}
```

## Best Practices

1. **Always use HTTPS** in production environments
2. **Set appropriate timeouts** for downstream services
3. **Monitor rate limits** and adjust them based on your service's capacity
4. **Use environment variables** for configuration
5. **Implement circuit breakers** for critical services
6. **Log all gateway operations** for debugging and monitoring

## Common Issues and Solutions

### 1. 401 Unauthorized
- Ensure you're including a valid JWT token
- Check if the token has expired
- Verify the token's signature

### 2. 429 Too Many Requests
- Implement request queuing
- Increase rate limits if needed
- Consider implementing a caching strategy

### 3. 502 Bad Gateway
- Check if the downstream service is running
- Verify the `DOWNSTREAM_URL` configuration
- Check network connectivity

### 4. 504 Gateway Timeout
- Increase timeout settings
- Check downstream service performance
- Implement circuit breakers

## Advanced Usage

### Custom Headers

You can add custom headers that will be forwarded to downstream services:

```bash
curl http://gateway:3000/gateway/api/users \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Custom-Header: value"
```

### Query Parameters

Query parameters are automatically forwarded:

```bash
curl "http://gateway:3000/gateway/api/users?page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### File Uploads

The gateway supports file uploads:

```bash
curl -X POST http://gateway:3000/gateway/api/upload \
  -H "Authorization: Bearer your-jwt-token" \
  -F "file=@/path/to/file.jpg"
```

## Monitoring and Debugging

### Logging

The gateway logs all requests and responses. Check your logs for:

- Request details (method, URL, headers)
- Response status and timing
- Error messages and stack traces

### Metrics

Monitor these key metrics:

- Request rate and latency
- Error rates
- Rate limit hits
- Downstream service health

## Security Considerations

1. Always use HTTPS in production
2. Implement proper CORS policies
3. Validate all incoming requests
4. Sanitize request headers
5. Implement proper authentication and authorization
6. Regular security audits
7. Keep dependencies updated 