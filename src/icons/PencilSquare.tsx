import React from 'react';
import {IconProps} from './IconProps';

function PencilSquare(props: IconProps) {
  return (
      <i className={`pencil-square bi bi-pencil-square pencil-square-color ${props.className}`}
         style={{fontSize: `${props.size}g`, margin: `0 4px 0 0`}}
         title={ props.iconTitle != null ? props.iconTitle : 'pencil-square'}
      ></i>
  );
}

export default PencilSquare;
