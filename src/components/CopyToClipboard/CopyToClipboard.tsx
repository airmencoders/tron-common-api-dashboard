import React from 'react';
import {CopyToClipboardProps} from './CopyToClipboardProps';
import { CopyToClipboard as ReactCopyToClipboard } from 'react-copy-to-clipboard'

import './CopyToClipboard.scss';
import CopyIcon from "../../icons/CopyIcon";
import Button from "../Button/Button";

function CopyToClipboard(props: CopyToClipboardProps) {
  const { ...rest } = props;
  return (
    <ReactCopyToClipboard {...rest } >
      <Button type="button" className={'usa-button inline-icon'}>
        <CopyIcon iconTitle={'copyToClipboard'} size={1} />
      </Button>
    </ReactCopyToClipboard>
  );
}

export default CopyToClipboard;



