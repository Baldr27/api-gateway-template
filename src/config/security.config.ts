import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: process.env.CORS_METHODS?.split(',') || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  rateLimit: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '60', 10),
    max: parseInt(process.env.CACHE_MAX || '100', 10),
  },
})); 