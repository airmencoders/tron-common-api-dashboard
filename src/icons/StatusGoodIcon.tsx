import React from 'react';

import '../styles/_colors.scss';
import '../styles/_icons.scss';
import { getIconColorClassname } from './icon-util';
import {IconProps} from './IconProps';

function StatusGoodIcon(props: IconProps) {
  return (
      <i 
        className={
          `status-good-icon bi bi-check-circle-fill ` +
          `${getIconColorClassname(props.style, props.disabled, 'success-icon-color')} ` +
          `${props.className || ''}`
        }
        style={{fontSize: `${props.size}rem`}}
        title={ props.iconTitle != null ? props.iconTitle : 'good'}
      ></i>
  );
}

export default StatusGoodIcon;
