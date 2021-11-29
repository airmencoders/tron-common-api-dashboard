import { ICellRendererParams } from 'ag-grid-community';
import { documentSpaceDownloadUrlService } from '../../state/document-space/document-space-state';
import './DocumentDownloadCellRenderer.scss';
import GridDownloadButton from '../../components/documentspace/GridDownloadButton/GridDownloadButton';

function DocumentDownloadCellRenderer(props: Partial<ICellRendererParams>) {
  const downloadUrlService = documentSpaceDownloadUrlService();

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
                ? downloadUrlService.createRelativeFilesDownloadUrl(
                    space,
                    path,
                    [props.node?.data]
                  )
                : downloadUrlService.createRelativeDownloadFileUrl(
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
