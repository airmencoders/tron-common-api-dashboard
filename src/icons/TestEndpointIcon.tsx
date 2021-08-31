import {IconProps} from './IconProps';
import React from 'react';
import { getIconColorClassname } from './icon-util';

function TestEndpointIcon(props: IconProps) {
  return (
      <i 
        className={
          `test-endpoint-icon bi bi-lightning-fill ` +
          `${getIconColorClassname(props.style, props.disabled)} ` +
          `${props.className || ''}`
        }
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'test-endpoint'}
      ></i>
  );
}

export default TestEndpointIcon;
