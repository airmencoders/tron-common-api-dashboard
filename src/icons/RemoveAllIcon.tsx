import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function RemoveAllIcon(props: IconProps) {
  return (
    <svg
      className={`svg-icon ` + `${getSvgIconColorClassname(props.style, props.disabled)} ` + `${props.className ?? ''}`}
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`}
      height={`${props.size}em`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.iconTitle ?? 'remove all'}</title>
      <path
        d="M1.71501 7.59016H22.285C23.425 7.59016 24 6.91425 24 5.78436V4.8058C24 3.67591 23.425 3 22.285 3H1.71501C0.635561 3 0 3.67591 0 4.8058V5.78436C0 6.91425 0.575032 7.59016 1.71501 7.59016ZM6.69861 21.5725H17.2913C19.2787 21.5725 20.0757 20.5233 20.3682 18.5662L21.8008 8.96217H2.18916L3.63178 18.5662C3.92434 20.5334 4.72131 21.5725 6.69861 21.5725ZM8.98865 18.7781C8.54477 18.7781 8.1715 18.3947 8.1715 17.9609C8.1715 17.7289 8.28247 17.5473 8.42371 17.4061L10.8651 14.9445L8.42371 12.4729C8.28247 12.3317 8.1715 12.1501 8.1715 11.918C8.1715 11.4842 8.54477 11.1311 8.98865 11.1311C9.2005 11.1311 9.36192 11.232 9.53342 11.3733L11.995 13.8247L14.4767 11.3632C14.6482 11.2119 14.8197 11.111 15.0214 11.111C15.4754 11.111 15.8386 11.4741 15.8386 11.918C15.8386 12.14 15.7377 12.2913 15.5864 12.4628L13.1349 14.9445L15.5763 17.396C15.7175 17.5473 15.8285 17.7188 15.8285 17.9609C15.8285 18.3947 15.4552 18.7781 15.0214 18.7781C14.7894 18.7781 14.6078 18.657 14.4565 18.5259L11.995 16.0643L9.54351 18.5259C9.39218 18.6671 9.2005 18.7781 8.98865 18.7781Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export default RemoveAllIcon;