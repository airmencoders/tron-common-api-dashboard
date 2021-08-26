import React from 'react';
import { getIconColorClassname } from './icon-util';
import {IconProps} from './IconProps';

function CloseIcon(props: IconProps) {
  return (
      <i 
        className={
          `close-icon bi bi-x ` +
          `${getIconColorClassname(props.style, props.disabled)} ` +
          `${props.className || ''}`
        }
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'close'}
      ></i>
  );
}

export default CloseIcon;
