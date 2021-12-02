import { getSvgIconColorClassname } from './icon-util';
import { IconProps } from './IconProps';
import { SvgIconProps } from './SvgIconProps';

function CloseIcon2(props: IconProps & SvgIconProps) {
  return (
    <svg
      className={`svg-icon ` +
        `${getSvgIconColorClassname(props.style, props.disabled)} ` +
        `${props.className ?? ''}`
      }
      style={{ fontSize: `${props.size}em` }}
      width={`${props.size}em`} height={`${props.size}em`}
      viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.iconTitle ?? 'Close'}</title>
      <path d="M0.293771 16.2758C-0.0922266 16.6618 -0.103579 17.3202 0.293771 17.7062C0.691121 18.0922 1.34959 18.0922 1.73559 17.7062L9.00142 10.4404L16.2673 17.7062C16.6533 18.0922 17.3231 18.1036 17.7091 17.7062C18.0951 17.3089 18.0951 16.6618 17.7091 16.2758L10.4432 8.99858L17.7091 1.73275C18.0951 1.34675 18.1064 0.688283 17.7091 0.302285C17.3117 -0.0950653 16.6533 -0.0950653 16.2673 0.302285L9.00142 7.56812L1.73559 0.302285C1.34959 -0.0950653 0.679768 -0.106418 0.293771 0.302285C-0.0922266 0.699635 -0.0922266 1.34675 0.293771 1.73275L7.55961 8.99858L0.293771 16.2758Z" fill="#C2C4CB"/>
    </svg>

  );
}

export default CloseIcon2;
