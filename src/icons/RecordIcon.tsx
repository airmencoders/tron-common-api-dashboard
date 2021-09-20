import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function RecordIcon(props: IconProps) {
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
      <title>{props.iconTitle ?? 'record'}</title>
      <path d="M2 3H7.4C8.35478 3 9.27045 3.37928 9.94558 4.05442C10.6207 4.72955 11 5.64522 11 6.6V19.2C11 18.4839 10.7155 17.7972 10.2092 17.2908C9.70284 16.7845 9.01608 16.5 8.3 16.5H2V3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 3H14.6C13.6452 3 12.7295 3.37928 12.0544 4.05442C11.3793 4.72955 11 5.64522 11 6.6V19.2C11 18.4839 11.2845 17.7972 11.7908 17.2908C12.2972 16.7845 12.9839 16.5 13.7 16.5H20V3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default RecordIcon;