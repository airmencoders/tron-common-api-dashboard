import React from 'react';
import {IconProps} from './IconProps';

function RemoveIcon(props: IconProps) {
  return (
      <i className="remove-icon bi bi-trash remove-icon-color"
         style={{fontSize: `${props.size}rem`}}
         title="remove"
      ></i>
  );
}

export default RemoveIcon;
