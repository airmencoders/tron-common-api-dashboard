import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function AppsIcon(props: IconProps) {
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
      <title>{props.iconTitle ?? 'apps'}</title>
      <path d="M9.00003 2H2V9.00003H9.00003V2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 2H13V9.00003H20V2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 13H13V20H20V13Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.00003 13H2V20H9.00003V13Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default AppsIcon;