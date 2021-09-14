import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function DownArrowIcon(props: IconProps) {
  return (
    <svg
      className={`svg-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled)} ` +
        `${props.className ?? ''}`
      }
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`} height={`${props.size}em`}
      viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.iconTitle ?? 'down arrow'}</title>
      <path d="M1 1L6 6L11 1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

  );
}

export default DownArrowIcon;