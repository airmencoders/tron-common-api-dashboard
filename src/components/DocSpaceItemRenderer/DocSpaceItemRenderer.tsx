import React from 'react';
import FolderIcon from '../../icons/FolderIcon';
import {DocumentDto, RecentDocumentDto} from '../../openapi';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import './DocSpaceItemRenderer.scss';
import {ICellRendererParams} from 'ag-grid-community';
import {ClickableCellRenderer} from '../Grid/clickable-cell-renderer';
import {documentSpaceDownloadUrlService} from '../../state/document-space/document-space-state';
import StarIcon from "../../icons/StarIcon";

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

  const data = props.node?.data as DocumentDto & RecentDocumentDto;
  const path = data?.path;
  const fileKey = data?.key;
  let space = data?.spaceId;

  // if we didn't get spaceId then perhaps its a RecentDocumentDto, in which
  //  case we need to look in a different place
  if (!!!space) {
    space = data?.documentSpace?.id;
  }

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
              props.onClick(data);
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
    return ((props.isFavorited && props.isFavorited(data)) ? <span style={{marginLeft:8, bottom: '2px', position:'relative'} }>{<StarIcon size={1.1} fillColor={'#C2C4CB'}/> }</span> : null)
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
