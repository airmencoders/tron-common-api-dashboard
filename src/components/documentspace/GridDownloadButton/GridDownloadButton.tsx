import React from 'react';
import { GridDownloadButtonProps } from './GridDownloadButtonProps';
import Button from '../../Button/Button';
import DownloadIcon from '../../../icons/DownloadIcon';
import {createTextToast} from "../../Toast/ToastUtils/ToastUtils";
import {ToastType} from "../../Toast/ToastUtils/toast-type";

function GridDownloadButton(props: GridDownloadButtonProps) {

  const doc = props.doc
  const isFolder = doc?.folder
  const hasContents = doc?.hasContents
  const isEmptyFolder = isFolder && !hasContents

  const href = isEmptyFolder ? undefined : props.link

  return (
    <a
      onClick={()=>{
        if(href === undefined){
          createTextToast(ToastType.WARNING, 'Unable to download a folder with no contents')
        }
      }}
      href={href}
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