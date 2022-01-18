import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function CopyContentIcon(props: IconProps) {
  const fillColor = props.fillColor ? props.fillColor : '#5F96EA'
  return (
      <svg
          className={`svg-icon copy-content-icon` +
          `${getSvgIconColorClassname(props.style, props.disabled)} ` +
          `${props.className ?? ''}`
          }
          style={{ fontSize: `${props.size}em` }}
          width={`${props.size}em`} height={`${props.size}em`}
          viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <title>{props.iconTitle ?? 'copy'}</title>
        <path d="M0 0h24v24H0z" /><path fill={fillColor} d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>

);
}

export default CopyContentIcon;

