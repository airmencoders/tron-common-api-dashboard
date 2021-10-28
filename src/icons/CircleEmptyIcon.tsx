import { IconProps } from './IconProps';

export default function CircleEmptyIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>{ props.iconTitle != null ? props.iconTitle : 'circleEmpty'}</title>
      <path d="M9 18C13.9235 18 18 13.9147 18 9C18 4.07647 13.9147 0 8.99118 0C4.07647 0 0 4.07647 0 9C0 13.9147 4.08529 18 9 18ZM9 16.5C4.83529 16.5 1.50882 13.1647 1.50882 9C1.50882 4.83529 4.82647 1.5 8.99118 1.5C13.1559 1.5 16.4912 4.83529 16.5 9C16.5088 13.1647 13.1647 16.5 9 16.5Z" fill="#5F96EA"/>
    </svg>
  );
}
