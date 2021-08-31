import {IconProps} from './IconProps';
import React from 'react';
import { getIconColorClassname } from './icon-util';

function DownIcon(props: IconProps) {
  return (
      <i 
        className={
          `down-icon bi bi-arrow-down-circle ` +
          `${getIconColorClassname(props.style, props.disabled)} ` +
          `${props.className || ''}`
        }
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'down'}
      ></i>
  );
}

export default DownIcon;
