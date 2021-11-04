import { ICellRendererParams } from 'ag-grid-community';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { RecentDocumentDto } from '../../../openapi';
import GridDownloadButton from '../../../components/documentspace/GridDownloadButton/GridDownloadButton';

function RecentDocumentDownloadCellRenderer(props: Partial<ICellRendererParams>) {
  const documentSpaceService = useDocumentSpaceState();

  const recentDocument = props.value as RecentDocumentDto;

  return (
    <>
      {recentDocument &&
        <div className="document-download-cell-renderer">
          <GridDownloadButton
            link={documentSpaceService.createRelativeDownloadFileUrlBySpaceAndParent(recentDocument.documentSpace.id, recentDocument.parentFolderId, recentDocument.key, true)}
            title={recentDocument.key}
          />
        </div>
      }
    </>
  );
}

export default RecentDocumentDownloadCellRenderer;
