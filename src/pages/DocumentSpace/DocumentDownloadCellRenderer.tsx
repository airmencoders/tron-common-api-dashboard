import { ICellRendererParams } from 'ag-grid-community';
import { documentSpaceDownloadUrlService } from '../../state/document-space/document-space-state';
import './DocumentDownloadCellRenderer.scss';
import GridDownloadButton from '../../components/documentspace/GridDownloadButton/GridDownloadButton';

function DocumentDownloadCellRenderer(props: Partial<ICellRendererParams>) {
  const downloadUrlService = documentSpaceDownloadUrlService();

  const path = props.node?.data?.path;
  const fileKey = props.node?.data?.key;
  let space = props.node?.data?.spaceId;

  // if we didn't get spaceId then perhaps its a RecentDocumentDto, in which
  //  case we need to look in a different place
  if (!!!space) {
    space = props.node?.data?.documentSpace?.id;
  }
  
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
            doc={props.node?.data}
            title={fileKey}
          />
        </div>
      )}
    </div>
  );
}

export default DocumentDownloadCellRenderer;
