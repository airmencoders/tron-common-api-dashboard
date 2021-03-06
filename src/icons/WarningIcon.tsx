import React from 'react';
import { getIconColorClassname } from './icon-util';
import {IconProps} from './IconProps';

function WarningIcon(props: IconProps) {
  return (
      <i 
        className={
          `warning-icon bi bi-exclamation-triangle ` +
          `${getIconColorClassname(props.style, props.disabled, 'warning-icon-color')} ` +
          `${props.className || ''}`
        }
         style={{fontSize: `${props.size}rem`}}
         title={ props.iconTitle != null ? props.iconTitle : 'warning'}
      ></i>
  );
}

export default WarningIcon;
