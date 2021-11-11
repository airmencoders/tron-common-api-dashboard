import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';
import { SvgIconProps } from './SvgIconProps';

function EllipsesIcon(props: IconProps & SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 6" fill="none"
      className={`svg-icon ellipses-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled, props.fill)} ` +
        `${props.className ?? ''}`
      }
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`} height={`${props.size}em`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.iconTitle ?? 'more'}</title>
      <path d="M5.12831 2.54507C5.12831 1.13256 3.98303 0 2.54507 0C1.14528 0 0 1.13256 0 2.54507C0 3.95758 1.14528 5.09014 2.54507 5.09014C3.98303 5.09014 5.12831 3.95758 5.12831 2.54507ZM14.5451 2.54507C14.5451 1.13256 13.4125 0 12 0C10.6002 0 9.46766 1.13256 9.46766 2.54507C9.46766 3.95758 10.6002 5.09014 12 5.09014C13.4125 5.09014 14.5451 3.95758 14.5451 2.54507ZM24 2.54507C24 1.13256 22.8674 0 21.4549 0C20.017 0 18.8844 1.13256 18.8844 2.54507C18.8844 3.95758 20.017 5.09014 21.4549 5.09014C22.8674 5.09014 24 3.95758 24 2.54507Z" />
    </svg>
  );
}

export default EllipsesIcon;
