import React from 'react';
import { IconProps } from './IconProps';

function EditIcon(props: IconProps) {
  return (
    <i className={`edit-icon bi bi-pencil ${props.disabled ? 'icon-disabled-color' : 'edit-icon-color'} ${props.className || ''}`}
      style={{ fontSize: `${props.size}rem` }}
      title={props.iconTitle != null ? props.iconTitle : 'edit'}
    ></i>
  );
}

export default EditIcon;
