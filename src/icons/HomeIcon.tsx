import React from 'react';
import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function HomeIcon(props: IconProps) {
  return (
    <svg
      className={`svg-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled)} ` +
        `${props.className ?? ''}`
      }
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`} height={`${props.size}em`}
      viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.iconTitle ?? 'home'}</title>
      <path d="M2 8.3L11 2L20 8.3V18.2C20 18.6774 19.7893 19.1352 19.4142 19.4728C19.0391 19.8104 18.5304 20 18 20H4C3.46957 20 2.96086 19.8104 2.58579 19.4728C2.21071 19.1352 2 18.6774 2 18.2V8.3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.75 19.2801V10.6401H13.25V19.2801" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default HomeIcon;
