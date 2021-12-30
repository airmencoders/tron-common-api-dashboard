import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';

function InfoIcon(props: IconProps) {
  const fillColor = props.fillColor ? props.fillColor : '#5F96EA'
  return (
      <svg
          className={`svg-icon ellipses-icon` +
          `${getSvgIconColorClassname(props.style, props.disabled)} ` +
          `${props.className ?? ''}`
          }
          style={{ fontSize: `${props.size}em` }}
          width={`${props.size}em`} height={`${props.size}em`}
          viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <title>{props.iconTitle ?? 'star'}</title>
        <path d="M12 24C18.5647 24 24 18.5529 24 12C24 5.43529 18.5529 0 11.9882 0C5.43529 0 0 5.43529 0 12C0 18.5529 5.44706 24 12 24ZM12 22C6.44706 22 2.01176 17.5529 2.01176 12C2.01176 6.44706 6.43529 2 11.9882 2C17.5412 2 21.9882 6.44706 22 12C22.0118 17.5529 17.5529 22 12 22ZM11.8941 7.81176C12.7529 7.81176 13.4235 7.12941 13.4235 6.28235C13.4235 5.42353 12.7529 4.74118 11.8941 4.74118C11.0471 4.74118 10.3647 5.42353 10.3647 6.28235C10.3647 7.12941 11.0471 7.81176 11.8941 7.81176ZM9.94118 18.4706H14.7294C15.2118 18.4706 15.5882 18.1294 15.5882 17.6471C15.5882 17.1882 15.2118 16.8235 14.7294 16.8235H13.2706V10.8353C13.2706 10.2 12.9529 9.77647 12.3529 9.77647H10.1412C9.65882 9.77647 9.28235 10.1412 9.28235 10.6C9.28235 11.0824 9.65882 11.4235 10.1412 11.4235H11.4V16.8235H9.94118C9.45882 16.8235 9.08235 17.1882 9.08235 17.6471C9.08235 18.1294 9.45882 18.4706 9.94118 18.4706Z" fill={fillColor} />
      </svg>

);
}

export default InfoIcon;

