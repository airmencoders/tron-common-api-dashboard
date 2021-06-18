import React from 'react';
import {IconProps} from './IconProps';

function RemoveIcon(props: IconProps) {
  return (
      <i className={`remove-icon bi bi-trash ${props.disabled ? 'icon-disabled-color' : 'remove-icon-color'} ${props.className ?? ''}`}
         style={{fontSize: `${props.size}rem`}}
         title={ props.iconTitle != null ? props.iconTitle : 'remove'}
      ></i>
  );
}

export default RemoveIcon;
