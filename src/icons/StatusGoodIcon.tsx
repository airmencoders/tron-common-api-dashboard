import React from 'react';

import '../styles/_colors.scss';
import '../styles/_icons.scss';
import {IconProps} from './IconProps';

function StatusGoodIcon(props: IconProps) {
  return (
      <i className="status-good-icon bi bi-check-circle-fill success-icon-color"
         style={{fontSize: `${props.size}rem`}}
         title={ props.iconTitle != null ? props.iconTitle : 'good'}
      ></i>
  );
}

export default StatusGoodIcon;
