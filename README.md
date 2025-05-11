# NestJS API Gateway Template

A highly customizable API Gateway template built with NestJS, designed to be easily cloned and modified for different projects.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Google OAuth2 integration
  - Email/password authentication
  - Role-based access control (RBAC)
  - Session management

- 🌐 **API Gateway Features**
  - Request routing and forwarding
  - Rate limiting
  - Request/Response transformation
  - Circuit breaking
  - Load balancing
  - Caching
  - API documentation (Swagger/OpenAPI)

- 💾 **Database**
  - PostgreSQL integration with TypeORM
  - Database migrations
  - Repository pattern
  - Connection pooling
  - Database-agnostic design

- 🧪 **Testing**
  - Unit tests
  - E2E tests
  - Integration tests
  - Test coverage reporting

- 🛠 **Development Features**
  - Environment configuration
  - Logging
  - Health checks
  - Docker support
  - CI/CD ready

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Docker (optional)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd api-gateway-template

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migration:run

# Start the application
npm run start:dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=api_gateway

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

## Project Structure

```
src/
├── auth/                 # Authentication module
├── common/              # Common utilities and decorators
├── config/              # Configuration module
├── database/            # Database configuration and migrations
├── gateway/             # API Gateway core functionality
├── health/              # Health check endpoints
├── users/               # User management
└── main.ts             # Application entry point
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start the application in development mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run test:cov` - Run test coverage
- `npm run migration:generate` - Generate a new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert the last migration

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Gateway Features

The API Gateway module provides:

- **Request Routing & Proxying:**
  - All requests to `/gateway/*` are proxied to a downstream service (default: `http://localhost:4000`).
  - Configure the downstream service URL via the `DOWNSTREAM_URL` environment variable.
  - Example: `DOWNSTREAM_URL=http://localhost:4000`

- **Rate Limiting:**
  - Configurable per-user rate limiting (default: 10 requests per 60 seconds).
  - Uses NestJS Throttler under the hood.

- **Request/Response Transformation:**
  - All proxied requests and responses are logged and wrapped in a standard format.
  - Logging and transformation are handled by global interceptors.

- **Error Handling:**
  - Gateway errors are caught and returned with a standard error structure.

- **Extensibility:**
  - Add custom logic for circuit breaking, load balancing, or request/response modification in `GatewayService` or `GatewayController`.

### Example Usage

To proxy a request to a downstream service:

```
POST /gateway/api/v1/resource
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": "example"
}
```

This will be forwarded to `http://localhost:4000/api/v1/resource` (or your configured downstream URL).

### Environment Variables

Add to your `.env`:

```
DOWNSTREAM_URL=http://localhost:4000
```
