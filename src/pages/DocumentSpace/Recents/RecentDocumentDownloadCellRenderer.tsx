import { ICellRendererParams } from 'ag-grid-community';
import { documentSpaceDownloadUrlService } from '../../../state/document-space/document-space-state';
import { RecentDocumentDto } from '../../../openapi';
import GridDownloadButton from '../../../components/documentspace/GridDownloadButton/GridDownloadButton';

function RecentDocumentDownloadCellRenderer(props: Partial<ICellRendererParams>) {
  const downloadUrlService = documentSpaceDownloadUrlService();

  const recentDocument = props.value as RecentDocumentDto;

  return (
    <>
      {recentDocument &&
        <div className="document-download-cell-renderer">
          <GridDownloadButton
            link={downloadUrlService.createRelativeDownloadFileUrlBySpaceAndParent(recentDocument.documentSpace.id, recentDocument.parentFolderId, recentDocument.key, true)}
            title={recentDocument.key}
            doc={undefined}
          />
        </div>
      }
    </>
  );
}

export default RecentDocumentDownloadCellRenderer;
