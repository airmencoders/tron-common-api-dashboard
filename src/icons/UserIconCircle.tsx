import { IconProps } from './IconProps';

export default function UserIconCircle(props: IconProps) {
  return (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>{ props.iconTitle != null ? props.iconTitle : 'userIconCircle'}</title>
    <path d="M12 24C18.5647 24 24 18.5529 24 12C24 5.43529 18.5529 0 11.9882 0C5.43529 0 0 5.43529 0 12C0 18.5529 5.44706 24 12 24ZM12 16C8.45882 16 5.74118 17.2706 4.54118 18.6824C2.96471 16.9059 2.01176 14.5765 2.01176 12C2.01176 6.44706 6.43529 2 11.9882 2C17.5412 2 21.9882 6.44706 22 12C22.0118 14.5765 21.0471 16.9176 19.4588 18.6824C18.2706 17.2706 15.5412 16 12 16ZM12 14C14.2706 14.0235 16.0353 12.0941 16.0353 9.56471C16.0353 7.18823 14.2588 5.22353 12 5.22353C9.74118 5.22353 7.95294 7.18823 7.96471 9.56471C7.97647 12.0941 9.74118 13.9765 12 14Z" fill="#5F96EA"/>
  </svg>
);
}
