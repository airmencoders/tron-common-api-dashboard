import React from 'react';
import {IconProps} from './IconProps';
import {getSvgIconColorClassname} from './icon-util';

function CloseNavIcon(props: IconProps) {
  return (
      <svg
           className={`svg-icon close-nav-icon` +
             `${getSvgIconColorClassname(props.style, props.disabled)} ` +
             `${props.className ?? ''}`
           }
           width={props.size * 11} height={props.size * 18}
           viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 9C0 9.25922 0.093318 9.48733 0.290323 9.68433L8.51267 17.72C8.68894 17.9067 8.91705 18 9.18664 18C9.72581 18 10.1406 17.5956 10.1406 17.0565C10.1406 16.7869 10.0265 16.5588 9.8606 16.3825L2.31221 9L9.8606 1.61751C10.0265 1.44124 10.1406 1.20276 10.1406 0.943548C10.1406 0.404378 9.72581 0 9.18664 0C8.91705 0 8.68894 0.093318 8.51267 0.269585L0.290323 8.31567C0.093318 8.5023 0 8.74078 0 9Z" fill="#59E8C6"/>
      </svg>

  );
}

export default CloseNavIcon;
