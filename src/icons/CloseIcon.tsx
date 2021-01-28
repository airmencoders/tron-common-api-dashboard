import React from 'react';
import {IconProps} from './IconProps';

function CloseIcon(props: IconProps) {
  return (
      <i className="close-icon bi bi-x"
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'close'}
      ></i>
  );
}

export default CloseIcon;
