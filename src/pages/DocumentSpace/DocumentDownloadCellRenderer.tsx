import { ICellRendererParams } from 'ag-grid-community';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import './DocumentDownloadCellRenderer.scss';
import GridDownloadButton from '../../components/documentspace/GridDownloadButton/GridDownloadButton';

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
          <GridDownloadButton
            link={
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
            title={fileKey}
          />
        </div>
      )}
    </div>
  );
}

export default DocumentDownloadCellRenderer;
