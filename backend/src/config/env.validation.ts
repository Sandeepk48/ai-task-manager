/**
 * Fail fast in production when critical env vars are missing.
 * Called before NestFactory.create so misconfiguration surfaces in logs.
 */
export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const missing: string[] = [];
  for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
    if (!process.env[key]?.trim()) {
      missing.push(key);
    }
  }

  const hasCors =
    !!process.env.FRONTEND_URL?.trim() || !!process.env.CORS_ORIGINS?.trim();
  if (!hasCors) {
    missing.push('FRONTEND_URL or CORS_ORIGINS');
  }

  if (missing.length) {
    throw new Error(
      `Missing required environment variables for production: ${missing.join(', ')}`,
    );
  }
}
