import React from 'react';
import {IconProps} from './IconProps';
import {getSvgIconColorClassname} from './icon-util';
import {SvgIconProps} from './SvgIconProps';

function OpenNavIcon(props: IconProps & SvgIconProps) {
  return (
      <svg
          className={`svg-icon close-nav-icon` +
          `${getSvgIconColorClassname(props.style, props.disabled, props.fill)} ` +
          `${props.className ?? ''}`
          }
          width={props.size * 11} height={props.size * 18}
          viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10.1406 9C10.1406 8.74078 10.0369 8.5023 9.83986 8.31567L1.62788 0.269585C1.44124 0.093318 1.21313 0 0.943548 0C0.414747 0 0 0.404378 0 0.943548C0 1.20276 0.103687 1.44124 0.269585 1.61751L7.81797 9L0.269585 16.3825C0.103687 16.5588 0 16.7869 0 17.0565C0 17.5956 0.414747 18 0.943548 18C1.21313 18 1.44124 17.9067 1.62788 17.72L9.83986 9.68433C10.0369 9.48733 10.1406 9.25922 10.1406 9Z" fill="#59E8C6"/>
      </svg>
  );
}

export default OpenNavIcon;
