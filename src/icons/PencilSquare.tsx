import React from 'react';
import { getIconColorClassname } from './icon-util';
import {IconProps} from './IconProps';

function PencilSquare(props: IconProps) {
  return (
      <i 
        className={
          `pencil-square bi bi-pencil-square ` + 
          `${getIconColorClassname(props.style, props.disabled, 'pencil-square-color')} ` +
          `${props.className || ''}`
        }
         style={{fontSize: `${props.size}g`, margin: `0 0.75rem 0 0`}}
         title={ props.iconTitle != null ? props.iconTitle : 'pencil-square'}
      ></i>
  );
}

export default PencilSquare;
