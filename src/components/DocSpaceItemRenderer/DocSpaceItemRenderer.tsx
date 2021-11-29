import React from 'react';
import FolderIcon from '../../icons/FolderIcon';
import { DocumentDto } from '../../openapi';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import './DocSpaceItemRenderer.scss';
import { ICellRendererParams } from 'ag-grid-community';
import { ClickableCellRenderer } from '../Grid/clickable-cell-renderer';
import { documentSpaceDownloadUrlService } from '../../state/document-space/document-space-state';
import StarGrayIcon from "../../icons/StarGrayIcon";

export interface DocSpaceItemRendererProps {
  hideItemLink?: boolean;
  isFavorited?: (data: DocumentDto)=>boolean;
}

/**
 * Component for the file doc space explorer - deals with
 * directories and files
 */
function DocSpaceItemRenderer(props: Partial<ICellRendererParams> & ClickableCellRenderer & DocSpaceItemRendererProps) {
  const downloadUrlService = documentSpaceDownloadUrlService();

  const data = props.node?.data as DocumentDto;
  const path = data?.path;
  const fileKey = data?.key;
  const space = data?.spaceId;

  if (!data) {
    return <Spinner small />;
  }

  function renderFolderItem() {
    if (props.hideItemLink) {
      return <span>{data.key}</span>;
    } else {
      return (
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
          <span className="directory">{data.key}</span>
        </Button>
      );
    }
  }

  function renderFileItem() {
    if (props.hideItemLink) {
      return <span>{data.key}</span>;
    } else {
      return (
        <a
          href={downloadUrlService.createRelativeDownloadFileUrl(space, path, fileKey)}
          target="_blank"
          rel="noreferrer"
        >
          {data.key}
        </a>
      );
    }
  }

  function renderFavoritedStatus() {
    return ((props.isFavorited && props.isFavorited(data)) ? <span style={{marginLeft: '8px'} }>{<StarGrayIcon size={1.3} fill={false} disabled={true}/> }</span> : null)
  }

  return (
    <div className="loading-cell-renderer" data-testid={`docspace-item-cell-renderer__${data.key}`}>
      {data.folder ? <FolderIcon /> : null}
      {'  '}
      {data.folder ? renderFolderItem() : renderFileItem()}
      {renderFavoritedStatus()}
    </div>
  );
}

export default DocSpaceItemRenderer;
