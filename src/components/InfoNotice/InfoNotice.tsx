import React from 'react';

import {InfoNoticeProps} from './InfoNoticeProps';
import { Alert } from '@trussworks/react-uswds/lib/index'
import './InfoNotice.scss';

function InfoNotice(props: InfoNoticeProps) {
  return (
      <div className="info-notice">
        <Alert {...props}>{props.children}</Alert>
      </div>
  );
}

export default InfoNotice;
