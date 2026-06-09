export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureProjectEnvLoaded } = await import('./lib/serverEnv');
    ensureProjectEnvLoaded();
  }
}