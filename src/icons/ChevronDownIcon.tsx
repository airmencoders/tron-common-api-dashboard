import React from 'react';
import { getIconColorClassname } from './icon-util';
import {IconProps} from './IconProps';

function ChevronDownIcon(props: IconProps) {
  return (
      <i 
        className={
          `chevron-down-icon bi bi-chevron-down ` +
          `${getIconColorClassname(props.style, props.disabled)} ` +
          `${props.className}`
        }
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'down'}
      ></i>
  );
}

export default ChevronDownIcon;
