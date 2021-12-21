import {getSvgIconColorClassname} from './icon-util';
import {IconProps} from './IconProps';

function LockIcon(props: IconProps) {
  const fillColor = props.fillColor ? props.fillColor : '#5F96EA'
  return (
    <svg
      className={`svg-icon ellipses-icon` +
      `${getSvgIconColorClassname(props.style, props.disabled)} ` +
      `${props.className ?? ''}`
      }
      style={{fontSize: `${props.size}em`}}
      width={`${props.size}em`} height={`${props.size}em`}
      viewBox="0 0 29 40" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.iconTitle ?? 'lock'}</title>
      <path
        d="M5.23576 40H23.9201C26.9798 40 28.4892 38.4702 28.4892 35.1453V21.0913C28.4892 18.1948 27.3265 16.665 24.9604 16.3386V11.4023C24.9604 3.71239 19.9221 0 14.5779 0C9.23372 0 4.19548 3.71239 4.19548 11.4023V16.3386C1.82934 16.665 0.666668 18.1948 0.666668 21.0913V35.1453C0.666668 38.4702 2.1761 40 5.23576 40ZM7.47952 10.974C7.47952 5.85416 10.7636 3.14125 14.5779 3.14125C18.3923 3.14125 21.6764 5.85416 21.6764 10.974V16.2774H7.47952V10.974ZM5.35815 36.9403C4.41985 36.9403 3.95071 36.512 3.95071 35.3697V20.8873C3.95071 19.745 4.41985 19.3371 5.35815 19.3371H23.8181C24.7564 19.3371 25.2052 19.745 25.2052 20.8873V35.3697C25.2052 36.512 24.7564 36.9403 23.8181 36.9403H5.35815Z"
        fill={fillColor}/>
    </svg>

  );
}

export default LockIcon;
