import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function PasteIcon(props: IconProps) {
  const fillColor = props.fillColor ? props.fillColor : '#5F96EA'
  return (
      <svg
          className={`svg-icon paste-icon` +
          `${getSvgIconColorClassname(props.style, props.disabled)} ` +
          `${props.className ?? ''}`
          }
          style={{ fontSize: `${props.size}em` }}
          width={`${props.size}em`} height={`${props.size}em`}
          viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <title>{props.iconTitle ?? 'paste'}</title>
        <path d="M0 0h24v24H0z" /><path fill={fillColor} d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/>
      </svg>

);
}

export default PasteIcon;

