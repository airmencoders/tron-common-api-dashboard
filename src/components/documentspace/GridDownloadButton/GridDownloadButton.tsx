import React from 'react';
import { GridDownloadButtonProps } from './GridDownloadButtonProps';
import Button from '../../Button/Button';
import DownloadIcon from '../../../icons/DownloadIcon';

function GridDownloadButton(props: GridDownloadButtonProps) {
  return (
    <a
      href={props.link}
    >
      <Button
        type="button"
        unstyled
        className="document-download-cell-renderer__btn"
        disableMobileFullWidth
        transparentBackground
      >
        <DownloadIcon iconTitle={props.title ? `Download ${props.title}` : "Download"} size={1.25} />
      </Button>
    </a>
  );
}

export default GridDownloadButton;