import type { Plugin } from 'vite';
import { registerAssetRoutes } from './routes/assets.ts';
import { registerCommentRoutes } from './routes/comments.ts';
import { type ApiPluginOptions, makeContext } from './routes/context.ts';
import { registerDocRoutes } from './routes/docs.ts';
import { registerEditRoutes } from './routes/edit.ts';
import { registerFolderRoutes } from './routes/folders.ts';
import { registerRestartRoutes } from './routes/restart.ts';
import { registerSvglRoutes } from './routes/svgl.ts';
import { registerTemplateRoutes } from './routes/templates.ts';
import { registerUpdateRoutes } from './routes/update.ts';
import { registerWatchers } from './routes/watchers.ts';

export type { ApiPluginOptions };

// All open-pdf dev-server endpoints in one plugin. To see the routes
// owned by a group, open the matching file under `routes/` — each file
// leads with a comment-block manifest of its endpoints.
export function apiPlugin(opts: ApiPluginOptions): Plugin {
  return {
    name: 'open-pdf:api',
    apply: 'serve',
    configureServer(server) {
      const ctx = makeContext(opts);
      registerWatchers(server, ctx);
      registerEditRoutes(server, ctx);
      registerCommentRoutes(server, ctx);
      registerDocRoutes(server, ctx);
      registerAssetRoutes(server, ctx);
      registerSvglRoutes(server);
      registerFolderRoutes(server, ctx);
      registerTemplateRoutes(server, ctx);
      registerUpdateRoutes(server, ctx);
      registerRestartRoutes(server);
    },
  };
}
