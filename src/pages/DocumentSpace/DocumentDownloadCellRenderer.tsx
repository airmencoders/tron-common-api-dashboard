import { ICellRendererParams } from 'ag-grid-community';
import DownloadIcon from '../../icons/DownloadIcon';
import Button from '../../components/Button/Button';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import './DocumentDownloadCellRenderer.scss';

function DocumentDownloadCellRenderer(props: Partial<ICellRendererParams>) {
  const documentSpaceService = useDocumentSpaceState();

  const path = props.node?.data?.path;
  const fileKey = props.node?.data?.key;
  const space = props.node?.data?.spaceId;
  const isFolder = props.node?.data?.folder;

  return (
    <div>
      {fileKey && space && (
        <div className="document-download-cell-renderer">
          <a
            href={
              isFolder
                ? documentSpaceService.createRelativeFilesDownloadUrl(
                    space,
                    path,
                    [props.node?.data]
                  )
                : documentSpaceService.createRelativeDownloadFileUrl(
                    space,
                    path,
                    fileKey,
                    true
                  )
            }
          >
            <Button
              type="button"
              unstyled
              className="document-download-cell-renderer__btn"
              disableMobileFullWidth
              transparentBackground
            >
              <DownloadIcon iconTitle={`Download ${fileKey}`} size={1.25} />
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

export default DocumentDownloadCellRenderer;
