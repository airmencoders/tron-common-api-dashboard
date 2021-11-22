import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';
import { SvgIconProps } from './SvgIconProps';

export default function PeopleIcon2(props: IconProps & SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 16"
      width={`${props.size}em`}
      height={`${props.size}em`}
      style={{ fontSize: `${props.size}em` }}
      className={
        `svg-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled, props.fill)} ` +
        `${props.className ?? ''}`
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.iconTitle != null ? props.iconTitle : 'people2'}</title>
      <path d="M16.5957 7.67718C18.4798 7.67718 20.1086 5.98679 20.1086 3.78577C20.1086 1.61115 18.471 0 16.5957 0C14.7117 0 13.0653 1.64637 13.0741 3.80337C13.0741 5.98679 14.7029 7.67718 16.5957 7.67718ZM6.45341 7.87968C8.09978 7.87968 9.51724 6.40059 9.51724 4.4901C9.51724 2.59721 8.09098 1.19736 6.45341 1.19736C4.82465 1.19736 3.38078 2.63243 3.38958 4.5077C3.38958 6.40059 4.81585 7.87968 6.45341 7.87968ZM1.54952 15.8298H8.23184C7.31621 14.5004 8.43434 11.8239 10.336 10.3624C9.34996 9.71093 8.09098 9.22671 6.45341 9.22671C2.48276 9.22671 0 12.1585 0 14.5972C0 15.3896 0.431401 15.8298 1.54952 15.8298ZM11.058 15.8298H22.1159C23.507 15.8298 24 15.4336 24 14.6588C24 12.3874 21.1563 9.25312 16.5869 9.25312C12.0264 9.25312 9.18269 12.3874 9.18269 14.6588C9.18269 15.4336 9.67572 15.8298 11.058 15.8298Z" fill="white" />
    </svg>
  );
}
