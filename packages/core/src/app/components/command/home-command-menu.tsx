import { Image as ImageIcon, LayoutTemplate, Palette, Presentation } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocTitles } from '@/lib/use-doc-titles';
import { useLocale } from '@/lib/use-locale';
import { docIds } from '../../lib/docs';
import type { Folder } from '../../lib/sdk';
import { FolderIconChip } from '../sidebar/folder-item';
import { ALL_DOCS_ID, ASSETS_ID, DRAFT_ID, TEMPLATES_ID, THEMES_ID } from '../sidebar/sidebar';
import { type CommandGroupSpec, CommandMenu, type CommandSpec } from './command-menu';

export function HomeCommandMenu({
  open,
  onOpenChange,
  folders,
  titleMap,
  onSelectView,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Folder[];
  titleMap: Record<string, string>;
  onSelectView: (id: string) => void;
}) {
  const t = useLocale();
  const navigate = useNavigate();
  const loadedTitles = useDocTitles(open);

  const groups = useMemo<CommandGroupSpec[]>(() => {
    const docs: CommandSpec[] = docIds.map((id) => ({
      id: `doc-${id}`,
      label: titleMap[id] ?? loadedTitles[id] ?? id,
      icon: <Presentation />,
      keywords: [id],
      run: () => navigate(`/s/${id}`),
    }));

    const folderItems: CommandSpec[] = [
      {
        id: `view-${ALL_DOCS_ID}`,
        label: t.home.docs,
        icon: <FolderIconChip icon={{ type: 'emoji', value: '🎞️' }} />,
        keywords: ['all', 'docs'],
        run: () => onSelectView(ALL_DOCS_ID),
      },
      {
        id: `view-${DRAFT_ID}`,
        label: t.home.draft,
        icon: <FolderIconChip icon={{ type: 'emoji', value: '📝' }} />,
        keywords: ['draft', 'unsorted'],
        run: () => onSelectView(DRAFT_ID),
      },
      ...folders.map((folder) => ({
        id: `view-${folder.id}`,
        label: folder.name,
        icon: <FolderIconChip icon={folder.icon} />,
        keywords: ['folder', folder.id],
        run: () => onSelectView(folder.id),
      })),
    ];

    const navigation: CommandSpec[] = [
      {
        id: `view-${THEMES_ID}`,
        label: t.home.themes,
        icon: <Palette />,
        keywords: ['themes', 'design'],
        run: () => onSelectView(THEMES_ID),
      },
    ];
    if (import.meta.env.DEV) {
      navigation.push({
        id: `view-${TEMPLATES_ID}`,
        label: t.home.templates,
        icon: <LayoutTemplate />,
        keywords: ['templates', 'new', 'create', 'invoice', 'report'],
        run: () => onSelectView(TEMPLATES_ID),
      });
      navigation.push({
        id: `view-${ASSETS_ID}`,
        label: t.home.assets,
        icon: <ImageIcon />,
        keywords: ['assets', 'images', 'files'],
        run: () => onSelectView(ASSETS_ID),
      });
    }

    return [
      { id: 'docs', heading: t.commandMenu.groupDocs, items: docs },
      { id: 'folders', heading: t.commandMenu.groupFolders, items: folderItems },
      { id: 'navigation', heading: t.commandMenu.groupNavigation, items: navigation },
    ];
  }, [t, folders, titleMap, loadedTitles, navigate, onSelectView]);

  return (
    <CommandMenu
      open={open}
      onOpenChange={onOpenChange}
      groups={groups}
      placeholder={t.commandMenu.placeholder}
    />
  );
}
