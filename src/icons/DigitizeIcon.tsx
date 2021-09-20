import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function DigitizeIcon(props: IconProps) {
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
      <title>{props.iconTitle ?? 'digitize'}</title>
      <path d="M4.7 15.6H3.8C3.32261 15.6 2.86477 15.4104 2.52721 15.0728C2.18964 14.7352 2 14.2774 2 13.8V4.8C2 4.32261 2.18964 3.86477 2.52721 3.52721C2.86477 3.18964 3.32261 3 3.8 3H18.2C18.6774 3 19.1352 3.18964 19.4728 3.52721C19.8104 3.86477 20 4.32261 20 4.8V13.8C20 14.2774 19.8104 14.7352 19.4728 15.0728C19.1352 15.4104 18.6774 15.6 18.2 15.6H17.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 13.8L15.5 19.2H6.5L11 13.8Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

  );
}

export default DigitizeIcon;