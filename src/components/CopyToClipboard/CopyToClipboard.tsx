import React from 'react';
import {CopyToClipboardProps} from './CopyToClipboardProps';
import { CopyToClipboard as ReactCopyToClipboard } from 'react-copy-to-clipboard'

import './CopyToClipboard.scss';

function CopyToClipboard(props: CopyToClipboardProps) {
  const { ...rest } = props;
  return (
    <ReactCopyToClipboard {...rest } />
  );
}

export default CopyToClipboard;
