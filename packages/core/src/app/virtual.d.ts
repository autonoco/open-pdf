declare module 'virtual:open-pdf/docs' {
  import type { DocModule } from './lib/sdk';
  export const docIds: string[];
  export const docThemes: Record<string, string>;
  export const docCreatedAt: Record<string, number>;
  export function loadDoc(id: string): Promise<DocModule>;
  export function docImportUrl(id: string): string;
}

declare module 'virtual:open-pdf/config' {
  import type { Locale } from '../locale/types';

  const config: {
    base?: string;
    docsDir?: string;
    port?: number;
    locale?: Locale;
    version: string;
    build: {
      showDocBrowser: boolean;
      showDocUi: boolean;
      allowHtmlDownload: boolean;
    };
  };
  export default config;
}

declare module 'virtual:open-pdf/folders' {
  import type { FoldersManifest } from './lib/sdk';

  const manifest: FoldersManifest;
  export default manifest;
}

declare module 'virtual:open-pdf/themes' {
  import type { DesignSystem } from './lib/design';
  import type { DocComponent } from './lib/sdk';

  export type ThemeMeta = {
    id: string;
    name: string;
    description: string;
    body: string;
    hasDemo: boolean;
  };

  export const themes: ThemeMeta[];
  export function loadThemeDemo(id: string): Promise<{
    default: DocComponent;
    design?: DesignSystem;
  }>;
  export function demoImportUrl(id: string): string;
}
