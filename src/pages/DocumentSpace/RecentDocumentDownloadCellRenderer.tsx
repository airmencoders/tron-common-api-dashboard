import { ICellRendererParams } from 'ag-grid-community';
import DownloadIcon from '../../icons/DownloadIcon';
import Button from '../../components/Button/Button';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import './DocumentDownloadCellRenderer.scss';
import { RecentDocumentDto } from '../../openapi';

function RecentDocumentDownloadCellRenderer(props: Partial<ICellRendererParams>) {
  const documentSpaceService = useDocumentSpaceState();

  const recentDocument = props.value as RecentDocumentDto;

  return (
    <>
      {recentDocument && 
        <div className="document-download-cell-renderer">
          <a
            href={documentSpaceService.createRelativeDownloadFileUrlBySpaceAndParent(recentDocument.documentSpace.id, recentDocument.parentFolderId, recentDocument.key)}
          >
            <Button
              type="button"
              unstyled
              className="recent-document-download-cell-renderer__btn"
              disableMobileFullWidth
              transparentBackground
            >
              <DownloadIcon iconTitle={`Download ${recentDocument.key}`} size={1.25} />
            </Button>
          </a>
        </div>
      }
    </>
  );
}

export default RecentDocumentDownloadCellRenderer;
