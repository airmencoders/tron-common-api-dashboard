import React from 'react';
import {IconProps} from './IconProps';

function ChevronDownIcon(props: IconProps) {
  return (
      <i className={`chevron-down-icon bi bi-chevron-down ${props.className}`}
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'close'}
      ></i>
  );
}

export default ChevronDownIcon;