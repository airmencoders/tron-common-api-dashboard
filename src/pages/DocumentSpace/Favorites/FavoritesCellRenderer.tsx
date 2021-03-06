import React from 'react';
import {ICellRendererParams} from 'ag-grid-community';
import {documentSpaceDownloadUrlService} from '../../../state/document-space/document-space-state';
import Spinner from '../../../components/Spinner/Spinner';
import {DocumentSpaceUserCollectionResponseDto} from '../../../openapi';
import FolderIcon from "../../../icons/FolderIcon";
import Button from "../../../components/Button/Button";
import {ClickableCellRenderer} from "../../../components/Grid/clickable-cell-renderer";
import StarIcon from "../../../icons/StarIcon";

function FavoritesCellRenderer(props: Partial<ICellRendererParams> & ClickableCellRenderer) {

  const downloadUrlService = documentSpaceDownloadUrlService();
  const value = props.data as DocumentSpaceUserCollectionResponseDto;

  if (!value) {
    return <Spinner small />;
  }

  function renderFavoritedStatus() {
    return (<span style={{marginLeft: '8px', bottom: '2px', position:'relative'} }>{<StarIcon fillColor={'#C2C4CB'} size={1.1}/> }</span>)
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
      <a href={downloadUrlService.createRelativeDownloadFileUrlBySpaceAndParent(
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
