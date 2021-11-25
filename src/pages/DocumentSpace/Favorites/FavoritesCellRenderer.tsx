import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import Spinner from '../../../components/Spinner/Spinner';
import {DocumentSpaceUserCollectionResponseDto} from '../../../openapi';
import FolderIcon from "../../../icons/FolderIcon";
import Button from "../../../components/Button/Button";
import {ClickableCellRenderer} from "../../../components/Grid/clickable-cell-renderer";
import StarGrayIcon from "../../../icons/StarGrayIcon";

function FavoritesCellRenderer(props: Partial<ICellRendererParams> & ClickableCellRenderer) {

  const documentSpaceService = useDocumentSpaceState();
  const value = props.data as DocumentSpaceUserCollectionResponseDto;

  if (!value) {
    return <Spinner small />;
  }

  function renderFavoritedStatus() {
    return (<span style={{marginLeft: '8px'} }>{<StarGrayIcon size={1.3}/> }</span>)
  }

  return (
    <div
      className="loading-cell-renderer"
      data-testid={`recent-item-cell-renderer__${value.id}`}
    >
      {value.folder ? <FolderIcon /> : null}
      {'  '}
      {value.folder ?
        <Button
          type="button"
          unstyled
          data-testid="favorites-folder-row-item"
          onClick={() => {
            if (value.folder) {
              props.onClick(value);
            }
          }}
        >
          <span className='directory'>{value.key}</span>
        </Button>
        :
      <a href={documentSpaceService.createRelativeDownloadFileUrlBySpaceAndParent(
        value.documentSpaceId,
        value.parentId!,
        value.key
      )} target="_blank" rel="noreferrer">{value.key}</a>
      }
      {renderFavoritedStatus()}
    </div>
  );
}

export default FavoritesCellRenderer;
