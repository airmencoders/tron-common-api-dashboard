import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function CircleMinusIcon(props: IconProps) {
  return (
      <svg
          className={`svg-icon circle-minus-icon` +
          `${getSvgIconColorClassname(props.style, props.disabled)} ` +
          `${props.className ?? ''}`
          }
          style={{ fontSize: `${props.size}em` }}
          width={`${props.size}em`} height={`${props.size}em`}
          viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <title>{props.iconTitle ?? 'remove'}</title>
        <path d="M9 18C13.9235 18 18 13.9147 18 9C18 4.07647 13.9147 0 8.99118 0C4.07647 0 0 4.07647 0 9C0 13.9147 4.08529 18 9 18ZM9 16.5C4.83529 16.5 1.50882 13.1647 1.50882 9C1.50882 4.83529 4.82647 1.5 8.99118 1.5C13.1559 1.5 16.4912 4.83529 16.5 9C16.5088 13.1647 13.1647 16.5 9 16.5ZM5.53235 9.75H12.4588C12.9529 9.75 13.2882 9.49412 13.2882 9.02647C13.2882 8.55 12.9706 8.27647 12.4588 8.27647H5.53235C5.02059 8.27647 4.69412 8.55 4.69412 9.02647C4.69412 9.49412 5.03824 9.75 5.53235 9.75Z" fill="#5F96EA"/>
      </svg>
);
}

export default CircleMinusIcon;
