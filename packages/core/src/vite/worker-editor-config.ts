import { type ConfigEnv, loadEnv, type UserConfig } from 'vite';

export function workerEditorEnabled(config: UserConfig, env: ConfigEnv, userCwd: string) {
  if (env.command !== 'build') return false;
  return loadEnv(env.mode, config.envDir ?? userCwd, 'VITE_').VITE_BUTTONS_WORKER_EDITOR === 'true';
}
