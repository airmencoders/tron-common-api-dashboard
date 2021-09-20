import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function SystemIcon(props: IconProps) {
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
      <title>{props.iconTitle ?? 'system'}</title>
      <path d="M20 11.2H2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.105 4.999L2 11.2V16.6C2 17.0774 2.18964 17.5352 2.52721 17.8728C2.86477 18.2104 3.32261 18.4 3.8 18.4H18.2C18.6774 18.4 19.1352 18.2104 19.4728 17.8728C19.8104 17.5352 20 17.0774 20 16.6V11.2L16.895 4.999C16.746 4.69911 16.5163 4.44673 16.2317 4.27025C15.9471 4.09377 15.6189 4.00018 15.284 4H6.716C6.38112 4.00018 6.05294 4.09377 5.76834 4.27025C5.48374 4.44673 5.25402 4.69911 5.105 4.999Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.6001 14.8H5.6091" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.19995 14.8H9.20895" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

  );
}

export default SystemIcon;