import {IconProps} from './IconProps';
import React from 'react';

function TestEndpointIcon(props: IconProps) {
  return (
      <i className={`test-endpoint-icon bi bi-lightning-fill ${props.className}`}
         style={{fontSize: `${props.size}em`}}
         title={ props.iconTitle != null ? props.iconTitle : 'test-endpoint'}
      ></i>
  );
}

export default TestEndpointIcon;
