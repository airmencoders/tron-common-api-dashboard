import React from 'react';
import FolderIcon from '../../icons/FolderIcon';
import { DocumentDto } from '../../openapi';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import './DocSpaceItemRenderer.scss';
import {ICellRendererParams} from 'ag-grid-community';
import {ClickableCellRenderer} from '../Grid/clickable-cell-renderer';
import {useDocumentSpaceState} from '../../state/document-space/document-space-state';

/**
 * Component for the file doc space explorer - deals with
 * directories and files
 */
function DocSpaceItemRenderer(props: Partial<ICellRendererParams> & ClickableCellRenderer) {

  const documentSpaceService = useDocumentSpaceState();

  const data = props.node?.data as DocumentDto;
  const path = data?.path;
  const fileKey = data?.key;
  const space = data?.spaceId;

  if (!data) {
    return <Spinner small />;
  }

  return (
    <div
      className="loading-cell-renderer"
      data-testid={`docspace-item-cell-renderer__${data.key}`}
    >
      {data.folder ? <FolderIcon /> : null}
      {'  '}
      {data.folder ?
        <Button
          type="button"
          unstyled
          data-testid="docspace-row-item"
          onClick={() => {
            if (data.folder) {
              props.onClick(data.key);
            }
          }}
        >
          <span className='directory'>{data.key}</span>
        </Button>
      :
        <a href={documentSpaceService.createRelativeDownloadFileUrl(
            space,
            path,
            fileKey
        )} target="_blank" rel="noreferrer">{data.key}</a>
      }
    </div>
  );
}

export default DocSpaceItemRenderer;
