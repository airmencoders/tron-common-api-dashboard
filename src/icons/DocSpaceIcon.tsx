import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

export default function DocSpaceIcon(props: IconProps) {
  return (
      <svg
          className={`svg-icon doc-space-icon ` +
          `${getSvgIconColorClassname(props.style, props.disabled)} ` +
          `${props.className ?? ''}`
          }
          width={`${props.size}em`} height={`${props.size}em`} viewBox="0 0 39 40"
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
      >
        <title>{props.iconTitle ?? 'Document Space'}</title>
        <path d="M5.5,35.6H35c3.2,0,5-1.8,5-5.5V12c0-3.6-1.9-5.5-5.5-5.5H17.6c-1.2,0-1.9-0.3-2.8-1l-1.1-0.9
	c-1.2-1-2.1-1.3-3.8-1.3h-5C1.8,3.3,0,5.1,0,8.6v21.5C0,33.8,1.8,35.6,5.5,35.6z M2.8,8.8c0-1.7,0.9-2.6,2.6-2.6h3.7
	c1.2,0,1.9,0.3,2.8,1.1L13,8.1c1.1,1,2.1,1.3,3.8,1.3h17.6c1.7,0,2.7,1,2.7,2.8v1H2.8V8.8z M5.6,32.7c-1.8,0-2.7-0.9-2.7-2.8V15.8
	h34.3V30c0,1.8-1,2.7-2.7,2.7H5.6z"/>
      </svg>
);
}
