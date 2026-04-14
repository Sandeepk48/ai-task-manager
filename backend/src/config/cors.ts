import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS for browser clients. Set `CORS_ORIGINS` (comma-separated) for multiple
 * frontends, or a single `FRONTEND_URL`. In development, localhost origins are
 * allowed when neither variable is set.
 */
export function buildCorsOptions(): CorsOptions {
  const rawList = process.env.CORS_ORIGINS?.trim();
  const single = process.env.FRONTEND_URL?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  let origin: CorsOptions['origin'];

  if (rawList) {
    const list = rawList.split(',').map((s) => s.trim()).filter(Boolean);
    origin = list.length === 1 ? list[0] : list;
  } else if (single) {
    origin = single;
  } else if (!isProd) {
    origin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  } else {
    throw new Error(
      'Production CORS: set FRONTEND_URL (single origin) or CORS_ORIGINS (comma-separated list).',
    );
  }

  return {
    origin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400,
  };
}
