import React from 'react';
import FolderIcon from '../../icons/FolderIcon';
import { DocumentDto } from '../../openapi';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import './DocSpaceItemRenderer.scss';

/**
 * Component for the file doc space explorer - deals with
 * directories and files
 */
function DocSpaceItemRenderer(props: any) {
  const data = props.node?.data as DocumentDto;
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
        <span>{data.key}</span>
      }
    </div>
  );
}

export default DocSpaceItemRenderer;
