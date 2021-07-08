import React from 'react';
import {IconProps} from './IconProps';

function ChevronUpIcon(props: IconProps) {
  return (
      <i className={`chevron-up-icon bi bi-chevron-up ${props.className}`}
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'close'}
      ></i>
  );
}

export default ChevronUpIcon;
