import React from 'react';

import '../styles/_colors.scss';
import '../styles/_icons.scss';
import { getIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function PlusIcon(props: IconProps) {
  return (
    <i
      className={
        `plus-icon bi bi-plus ` +
        `${getIconColorClassname(props.style, props.disabled, 'plus-icon-color')} ` +
        `${props.className || ''}`
      }
      style={{ fontSize: `${props.size}rem` }}
      title={props.iconTitle != null ? props.iconTitle : 'good'}
    ></i>
  );
}

export default PlusIcon;
