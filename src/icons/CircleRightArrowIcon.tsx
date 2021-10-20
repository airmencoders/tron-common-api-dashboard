import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function CircleRightArrowIcon(props: IconProps) {
  return (
      <svg
          className={`svg-icon circle-right-arrow-icon` +
          `${getSvgIconColorClassname(props.style, props.disabled)} ` +
          `${props.className ?? ''}`
          }
          style={{ fontSize: `${props.size}em` }}
          width={`${props.size}em`} height={`${props.size}em`}
          viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <title>{props.iconTitle ?? 'goto'}</title>
        <path d="M9 18C13.9235 18 18 13.9147 18 9C18 4.07647 13.9147 0 8.99118 0C4.07647 0 0 4.07647 0 9C0 13.9147 4.08529 18 9 18ZM9 16.5C4.83529 16.5 1.50882 13.1647 1.50882 9C1.50882 4.83529 4.82647 1.5 8.99118 1.5C13.1559 1.5 16.4912 4.83529 16.5 9C16.5088 13.1647 13.1647 16.5 9 16.5ZM13.5265 8.99118C13.5265 8.80588 13.4559 8.65588 13.2794 8.47941L10.2971 5.48824C10.1824 5.37353 10.0235 5.31176 9.83823 5.31176C9.47647 5.31176 9.20294 5.58529 9.20294 5.94706C9.20294 6.14118 9.28235 6.3 9.39706 6.41471L10.5 7.50882L11.5676 8.4L9.70588 8.32941H5.1C4.72059 8.32941 4.43824 8.61176 4.43824 8.99118C4.43824 9.37059 4.72059 9.65294 5.1 9.65294H9.70588L11.5676 9.58235L10.5 10.4824L9.39706 11.5676C9.27353 11.6912 9.20294 11.85 9.20294 12.0441C9.20294 12.3971 9.47647 12.6882 9.83823 12.6882C10.0235 12.6882 10.1824 12.6176 10.2971 12.5029L13.2794 9.51176C13.4471 9.34412 13.5265 9.19412 13.5265 8.99118Z" fill="#5F96EA"/>
      </svg>
  );
}

export default CircleRightArrowIcon;
