import React from 'react';
import { getIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function EditIcon(props: IconProps) {
  return (
    <i 
      className={
        `edit-icon bi bi-pencil ` + 
        `${getIconColorClassname(props.style, props.disabled, 'edit-icon-color')} ` +
        `${props.className || ''}`}
      style={{ fontSize: `${props.size}rem` }}
      title={props.iconTitle != null ? props.iconTitle : 'edit'}
    ></i>
  );
}

export default EditIcon;
