import { useLocale } from '@/lib/use-locale';
import { FolderIconChip } from '../components/sidebar/folder-item';
import { TemplatesGallery } from '../components/templates/templates-gallery';
import { templates } from '../lib/templates';

export function TemplatesPage() {
  const t = useLocale();
  return (
    <>
      <header className="mb-8 md:mb-12">
        <div className="flex flex-wrap items-center gap-3">
          <FolderIconChip icon={{ type: 'emoji', value: '📄' }} className="size-7 text-2xl" />
          <h1 className="font-heading text-[32px] font-semibold leading-[1.05] tracking-[-0.025em] md:text-[44px]">
            {t.templates.title}
          </h1>
          <span className="folio ml-1 self-end pb-2">
            {templates.length.toString().padStart(2, '0')}
          </span>
        </div>
      </header>
      <TemplatesGallery />
    </>
  );
}
