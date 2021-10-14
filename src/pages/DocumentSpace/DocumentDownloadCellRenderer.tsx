import { ICellRendererParams } from 'ag-grid-community';
import DownloadIcon from '../../icons/DownloadIcon';
import Button from '../../components/Button/Button';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import './DocumentDownloadCellRenderer.scss';

function DocumentDownloadCellRenderer(props: Partial<ICellRendererParams>) {
  const documentSpaceService = useDocumentSpaceState();

  const fileKey = props.node?.data?.key;
  const space = props.node?.data?.spaceId;

  return (
    <div>
      {fileKey && space &&
        <div className="document-download-cell-renderer">
          <a href={documentSpaceService.createRelativeDownloadFileUrl(space, fileKey)}>
            <Button type="button" unstyled className="document-download-cell-renderer__btn" disableMobileFullWidth transparentBackground>
              <DownloadIcon iconTitle={`Download ${fileKey}`} size={1.25} />
            </Button>
          </a>
        </div>
      }
    </div>
  );
}

export default DocumentDownloadCellRenderer;
