import React from 'react';
import { getIconColorClassname } from './icon-util';
import {IconProps} from './IconProps';

function RemoveIcon(props: IconProps) {
  return (
      <i 
        className={
          `remove-icon bi bi-trash ` + 
          `${getIconColorClassname(props.style, props.disabled, 'remove-icon-color')} ` +
          `${props.className || ''}`
        }
         style={{fontSize: `${props.size}rem`}}
         title={ props.iconTitle != null ? props.iconTitle : 'remove'}
      ></i>
  );
}

export default RemoveIcon;
