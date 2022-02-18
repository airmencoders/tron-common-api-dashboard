import RecentDocumentTile from '../../../components/RecentDocumentTile/RecentDocumentTile';
import FileIcon from '../../../icons/FileIcon';
import { RecentDocumentDto } from '../../../openapi';
import {
  documentSpaceDownloadUrlService,
  useDocumentSpaceState,
} from '../../../state/document-space/document-space-state';
import './RecentsBar.scss';

export interface RecentsBarProps {
  recents: RecentDocumentDto[];
}

export default function RecentsBar(props: RecentsBarProps) {
  const documentSpaceService = useDocumentSpaceState();
  const downloadUrlService = documentSpaceDownloadUrlService();

  return props.recents && props.recents.length > 0 ? (
    <>
      <div className="recents__bar">Recent Activity</div>
      <div className="recents__row">
        {props.recents.map((item) => (
          <span
            className="recent-tile-wrapper"
            onClick={async () => {
              const responsePath = await documentSpaceService.getDocumentSpaceEntryPath(
                item.documentSpace.id,
                item.parentFolderId
              );

              window.location.href = downloadUrlService.createRelativeDownloadFileUrl(
                item.documentSpace.id,
                responsePath,
                item.key,
                true
              );
            }}
            key={`${item.key}-${item.parentFolderId}-${item.lastModifiedDate}`}
          >
            <RecentDocumentTile
              icon={<FileIcon size={0.75} />}
              fileName={item.key}
              parentFolderId={item.parentFolderId}
              uploadedBy={item.lastActivityBy ?? 'Unknown'}
              timestamp={item.lastModifiedDate} // this is really the last activity date
              width={220}
              height={135}
            />
          </span>
        ))}
      </div>
    </>
  ) : null;
}
